import sys
import unittest
from unittest.mock import patch
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app
import data_engineering

class SliceTests(unittest.TestCase):
    def setUp(self):
        self.engine = app.Engine()

    def test_baseline_produces_conflict_and_suggestion(self):
        state = self.engine.ingest('Event Operations Manager', app.DEFAULT_NOTICE)
        self.assertEqual(state['pending']['conflicts'], ['205'])
        self.assertEqual(state['pending']['suggested_room'], 'B3-202')
        self.assertEqual(state['pending']['change']['start'], '17:30')

    def test_clear_scenario_resolves_italian_date_and_keeps_room(self):
        notice = "Il Faculty Roundtable #209 è stato spostato dalle 14:00 alle 16:00 del 1 novembre. La durata rimane di 90 minuti."
        state = self.engine.ingest('Event Operations Manager', notice)
        self.assertEqual(state['pending']['change']['date'], '2026-11-01')
        self.assertEqual(state['pending']['conflicts'], [])
        final = self.engine.decide('Space Coordinator', True)
        event = next(item for item in final['events'] if item['id'] == '209')
        self.assertEqual(event['start'], '16:00')
        self.assertEqual(event['room'], 'B3-202')

    def test_no_alternative_scenario_blocks_approval(self):
        state = self.engine.ingest('Event Operations Manager', app.DEFAULT_NOTICE, scenario_id='no-alternative')
        self.assertEqual(state['pending']['conflicts'], ['205'])
        self.assertIsNone(state['pending']['suggested_room'])
        with self.assertRaises(ValueError):
            self.engine.decide('Space Coordinator', True)
        self.assertEqual(self.engine.events[0]['start'], '15:00')

    def test_requires_human_approval(self):
        self.engine.ingest('Event Operations Manager', app.DEFAULT_NOTICE)
        self.assertEqual(self.engine.events[0]['start'], '15:00')
        with self.assertRaises(PermissionError):
            self.engine.decide('Event Operations Manager', True)
        self.assertEqual(self.engine.events[0]['start'], '15:00')
        final = self.engine.decide('Space Coordinator', True)
        self.assertEqual(final['events'][0]['start'], '17:30')
        self.assertEqual(final['events'][0]['room'], 'B3-202')
        self.assertEqual(final['pending']['status'], 'approved_and_applied_mock')
        self.assertEqual(final['bookings'][0]['start'], '17:30')
        self.assertEqual(final['bookings'][0]['end'], '19:00')
        self.assertTrue(any(a['action']=='mock_booking_updated' for a in self.engine.audit))

    def test_rejection_does_not_change_booking(self):
        self.engine.ingest('Event Operations Manager', app.DEFAULT_NOTICE)
        self.engine.decide('Space Coordinator', False)
        self.assertEqual(self.engine.events[0]['start'], '15:00')

    def test_invalid_extraction_requires_review(self):
        state=self.engine.ingest('Event Operations Manager', 'A meeting is perhaps moving sometime but no details were provided')
        self.assertEqual(state['pending']['status'],'human_review')
        self.assertEqual(self.engine.events[0]['start'],'15:00')

    def test_overlap_half_open(self):
        self.assertTrue(app.overlap(100,200,199,300))
        self.assertFalse(app.overlap(100,200,200,300))

    def test_evidence_is_verbatim(self):
        result=app.baseline_extract(app.DEFAULT_NOTICE)
        result['evidence']='invented'
        with self.assertRaises(ValueError):
            app.validate_extraction(result,app.DEFAULT_NOTICE,self.engine.events)

    def test_negated_change_requires_review(self):
        notice = "Il workshop AI #204 non è stato spostato alle 17:30 del 31 ottobre; dura 90 minuti."
        state = self.engine.ingest("Event Operations Manager", notice)
        self.assertEqual(state["pending"]["status"], "human_review")
        self.assertEqual(self.engine.events[0]["start"], "15:00")

    def test_admin_only_full_audit(self):
        self.engine.ingest('Event Operations Manager', app.DEFAULT_NOTICE)
        self.assertNotIn('audit',self.engine.snapshot('Event Operations Manager'))
        self.assertIn('audit',self.engine.snapshot('Administrator'))

    def test_non_owner_cannot_ingest(self):
        with self.assertRaises(PermissionError):
            self.engine.ingest('Administrator', app.DEFAULT_NOTICE)

    def test_backboard_json_is_validated_before_conflict_engine(self):
        model_output = {
            "event_id": "204",
            "date": "2026-10-31",
            "start": "17:30",
            "duration_min": 90,
            "evidence": "alle 17:30",
        }
        with patch.dict(app.os.environ, {"BACKBOARD_API_KEY": "test-key"}, clear=False), \
             patch("app.select_backboard_model", return_value=("google", "gemma-test")), \
             patch("app._backboard_request", return_value={"content": app.json.dumps(model_output)}) as request:
            state = self.engine.ingest("Event Operations Manager", app.DEFAULT_NOTICE, mode="backboard")
        self.assertEqual(state["pending"]["conflicts"], ["205"])
        self.assertEqual(state["pending"]["suggested_room"], "B3-202")
        request.assert_called_once()
        self.assertEqual(request.call_args.args[0], "/threads/messages")

    def test_backboard_receives_minimized_notice(self):
        model_output = {"event_id": "204", "date": "2026-10-31", "start": "17:30", "duration_min": 90, "evidence": "alle 17:30"}
        notice = app.DEFAULT_NOTICE + " Contatto: test@example.com, +39 333 123 4567."
        with patch.dict(app.os.environ, {"BACKBOARD_API_KEY": "test-key"}, clear=False), \
             patch("app.select_backboard_model", return_value=("google", "gemma-test")), \
             patch("app._backboard_request", return_value={"content": app.json.dumps(model_output)}) as request:
            self.engine.ingest("Event Operations Manager", notice, mode="backboard")
        sent_content = request.call_args.kwargs["payload"]["content"]
        self.assertNotIn("test@example.com", sent_content)
        self.assertNotIn("333 123 4567", sent_content)
        self.assertIn("[email rimossa]", sent_content)
        self.assertIn("[telefono rimosso]", sent_content)

    def test_backboard_invalid_json_fails_closed_to_review(self):
        with patch.dict(app.os.environ, {"BACKBOARD_API_KEY": "test-key"}, clear=False), \
             patch("app.select_backboard_model", return_value=("google", "gemma-test")), \
             patch("app._backboard_request", return_value={"content": "not json"}):
            state = self.engine.ingest("Event Operations Manager", app.DEFAULT_NOTICE, mode="backboard")
        self.assertEqual(state["pending"]["status"], "human_review")

    def test_google_adapter_output_enters_same_validation_pipeline(self):
        model_output = {
            "event_id": "204",
            "date": "2026-10-31",
            "start": "17:30",
            "duration_min": 90,
            "evidence": "alle 17:30",
            "method": "Google / gemma-4-31b-it",
        }
        with patch("app.google_extract", return_value=model_output) as extract:
            state = self.engine.ingest("Event Operations Manager", app.DEFAULT_NOTICE, mode="google")
        extract.assert_called_once_with(app.DEFAULT_NOTICE)
        self.assertEqual(state["pending"]["conflicts"], ["205"])

    def test_simulation_completes_demo_without_network(self):
        state = self.engine.ingest("Event Operations Manager", app.DEFAULT_NOTICE, mode="simulation")
        self.assertEqual(state["pending"]["change"]["method"], "Gemma 4 · simulazione demo")
        self.assertEqual(state["pending"]["suggested_room"], "B3-202")

    def test_data_quality_contract_and_references_pass(self):
        report = data_engineering.build_quality_report(app.DATASETS)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["referential_errors"], [])
        self.assertGreaterEqual(report["row_count"], 70)

    def test_normalized_event_index_has_stable_keys(self):
        index = data_engineering.normalized_event_index(app.BASE_EVENTS)
        self.assertEqual(index["204"]["event_key"], "event:204")
        self.assertEqual(index["204"]["start_minutes"], 900)

    def test_capacity_constraint_rejects_room_too_small_for_event(self):
        event = {"id": "x", "attendance_expected": 61}
        self.assertFalse(app.room_can_host(event, "2026-10-31", "17:30", 90, "B3-201"))
        self.assertTrue(app.room_can_host(event, "2026-10-31", "17:30", 90, "B3-202"))

    def test_notification_preview_is_derived_from_updated_event(self):
        self.engine.ingest("Event Operations Manager", app.DEFAULT_NOTICE, mode="simulation")
        self.engine.decide("Space Coordinator", True)
        preview = self.engine.notification_preview("Space Coordinator", "204")
        self.assertEqual(preview["recipient_count"], 4)
        self.assertIn("B3-202", preview["message"]["body"])

    def test_notification_send_is_role_gated_and_audited(self):
        with self.assertRaises(PermissionError):
            self.engine.send_notification("Event Operations Manager", "204")
        self.engine.ingest("Event Operations Manager", app.DEFAULT_NOTICE, mode="simulation")
        self.engine.decide("Space Coordinator", True)
        result = self.engine.send_notification("Space Coordinator", "204")
        self.assertEqual(result["status"], "mock_sent")
        self.assertTrue(any(a["action"] == "participant_notification_mock_sent" for a in self.engine.audit))

    def test_demo_reset_restores_synthetic_baseline(self):
        self.engine.ingest("Event Operations Manager", app.DEFAULT_NOTICE, mode="simulation")
        self.engine.decide("Space Coordinator", True)
        self.engine.send_notification("Space Coordinator", "204")
        state = self.engine.reset("Event Operations Manager")
        self.assertEqual(state["events"][0]["start"], "15:00")
        self.assertEqual(state["events"][0]["room"], "B3-201")
        self.assertEqual(state["pending"], None)
        self.assertEqual(state["source_count"], 0)
        self.assertEqual(state["notifications"], [])

    def test_privacy_minimization_redacts_direct_contact_identifiers(self):
        notice = "Scrivi a test@example.com oppure chiama +39 333 123 4567 per confermare."
        minimized, redactions = app.privacy_minimize(notice)
        self.assertNotIn("test@example.com", minimized)
        self.assertNotIn("333 123 4567", minimized)
        self.assertEqual(redactions, 2)

    def test_privacy_minimization_does_not_redact_iso_dates(self):
        minimized, redactions = app.privacy_minimize("Evento previsto il 2026-10-31 alle 17:30.")
        self.assertIn("2026-10-31", minimized)
        self.assertEqual(redactions, 0)

    def test_privacy_report_keeps_source_local_and_reports_minimized_input(self):
        report = app.privacy_report("Contatto: test@example.com")
        self.assertTrue(report["model_input_minimized"])
        self.assertTrue(report["raw_source_stored_locally"])
        self.assertEqual(report["redactions"], 1)

    def test_pending_change_exposes_privacy_report(self):
        notice = app.DEFAULT_NOTICE + " Contatto: test@example.com."
        state = self.engine.ingest("Event Operations Manager", notice, mode="simulation")
        self.assertEqual(state["pending"]["privacy"]["redactions"], 1)

if __name__=='__main__':unittest.main()
