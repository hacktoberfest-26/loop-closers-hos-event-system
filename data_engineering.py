"""Small, dependency-free data engineering layer for the vertical slice.

The fixtures are synthetic, but they are treated like operational data: each
dataset has a contract, identifiers are checked, and quality findings are
returned with the data rather than hidden in logs.
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime
import re

REQUIRED_FIELDS = {
    "events": ("id", "name", "date", "start", "duration_min", "room"),
    "rooms": ("id", "capacity", "status"),
    "bookings": ("id", "event_id", "room", "date", "start", "end", "status"),
    "buildings": ("id", "name", "category", "source_ref", "confidence"),
    "source_messages": ("id", "channel", "language", "received_at", "text", "expected_outcome"),
    "participants": ("id", "event_id", "name", "email", "language", "consent_email"),
    "notification_templates": ("id", "event_type", "language", "channel", "subject", "body"),
    "policies": ("id", "name", "scope", "rule", "on_violation"),
}
TIME_RE = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _null_fields(rows: list[dict]) -> list[str]:
    return sorted({field for row in rows for field, value in row.items() if value in (None, "")})


def profile_dataset(name: str, rows: list[dict]) -> dict:
    required = REQUIRED_FIELDS.get(name, ())
    errors: list[str] = []
    warnings: list[str] = []
    ids = [str(row.get("id")) for row in rows if row.get("id") is not None]
    for index, row in enumerate(rows):
        missing = [field for field in required if field not in row]
        if missing:
            errors.append(f"row {index}: missing {', '.join(missing)}")
        if name in {"events", "bookings"}:
            if row.get("date") and not DATE_RE.fullmatch(str(row["date"])):
                errors.append(f"row {index}: invalid date")
            if row.get("start") and not TIME_RE.fullmatch(str(row["start"])):
                errors.append(f"row {index}: invalid start time")
        if name == "events" and not isinstance(row.get("duration_min"), int):
            errors.append(f"row {index}: duration_min must be an integer")
        if name == "rooms" and (not isinstance(row.get("capacity"), int) or row.get("capacity", 0) <= 0):
            errors.append(f"row {index}: capacity must be positive")
        if name == "source_messages":
            try:
                datetime.fromisoformat(str(row.get("received_at", "")))
            except ValueError:
                errors.append(f"row {index}: invalid received_at")
    for duplicate in sorted(key for key, count in Counter(ids).items() if count > 1):
        errors.append(f"duplicate id: {duplicate}")
    null_fields = _null_fields(rows)
    if null_fields:
        warnings.append(f"nullable fields present: {', '.join(null_fields)}")
    return {"dataset": name, "rows": len(rows), "required_fields": list(required),
            "null_fields": null_fields, "errors": errors, "warnings": warnings,
            "status": "pass" if not errors else "fail"}


def build_quality_report(datasets: dict[str, list[dict]]) -> dict:
    profiles = [profile_dataset(name, rows) for name, rows in datasets.items()]
    errors: list[str] = []
    event_ids = {str(row.get("id")) for row in datasets.get("events", [])}
    room_ids = {str(row.get("id")) for row in datasets.get("rooms", [])}
    building_ids = {str(row.get("id")) for row in datasets.get("buildings", [])}
    for booking in datasets.get("bookings", []):
        if str(booking.get("event_id")) not in event_ids:
            errors.append(f"bookings: {booking.get('id')} references unknown event {booking.get('event_id')}")
        if str(booking.get("room")) not in room_ids:
            errors.append(f"bookings: {booking.get('id')} references unknown room {booking.get('room')}")
    for participant in datasets.get("participants", []):
        if str(participant.get("event_id")) not in event_ids:
            errors.append(f"participants: {participant.get('id')} references unknown event {participant.get('event_id')}")
    for profile in datasets.get("venue_profiles", []):
        if str(profile.get("venue_id")) not in building_ids:
            errors.append(f"venue_profiles: unknown venue {profile.get('venue_id')}")
    return {"status": "pass" if not errors and all(p["status"] == "pass" for p in profiles) else "fail",
            "dataset_count": len(datasets), "row_count": sum(len(rows) for rows in datasets.values()),
            "referential_errors": errors, "profiles": profiles}


def normalized_event_index(events: list[dict]) -> dict[str, dict]:
    """Create a stable lookup used by conflict checks and future ingestion jobs."""
    return {str(event["id"]): {**event, "event_key": f"event:{event['id']}",
                                "start_minutes": int(event["start"][:2]) * 60 + int(event["start"][3:])}
            for event in events}
