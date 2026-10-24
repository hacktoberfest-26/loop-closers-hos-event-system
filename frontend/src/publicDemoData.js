// Public demo projection. Direct contact fields and raw source text are intentionally excluded.

export const events = [
  {
    "id": "204",
    "name": "AI Workshop",
    "date": "2026-10-31",
    "start": "15:00",
    "duration_min": 90,
    "room": "B3-201",
    "format": "workshop",
    "attendance_expected": 42,
    "status": "confirmed"
  },
  {
    "id": "205",
    "name": "Corporate Training",
    "date": "2026-10-31",
    "start": "17:00",
    "duration_min": 120,
    "room": "B3-201",
    "format": "training",
    "attendance_expected": 28,
    "status": "confirmed"
  },
  {
    "id": "206",
    "name": "Startup Pitch",
    "date": "2026-10-31",
    "start": "18:00",
    "duration_min": 90,
    "room": "B3-203",
    "format": "demo",
    "attendance_expected": 65,
    "status": "confirmed"
  },
  {
    "id": "207",
    "name": "Research Demo Day",
    "date": "2026-11-01",
    "start": "09:30",
    "duration_min": 120,
    "room": "B3-202",
    "format": "conference",
    "attendance_expected": 80,
    "status": "confirmed"
  },
  {
    "id": "208",
    "name": "Student Orientation",
    "date": "2026-11-01",
    "start": "11:00",
    "duration_min": 60,
    "room": "B3-201",
    "format": "orientation",
    "attendance_expected": 34,
    "status": "confirmed"
  },
  {
    "id": "209",
    "name": "Faculty Roundtable",
    "date": "2026-11-01",
    "start": "14:00",
    "duration_min": 90,
    "room": "B3-202",
    "format": "roundtable",
    "attendance_expected": 18,
    "status": "tentative"
  },
  {
    "id": "210",
    "name": "Innovation Open Day",
    "date": "2026-11-02",
    "start": "10:00",
    "duration_min": 180,
    "room": "THE-HILL",
    "format": "conference",
    "attendance_expected": 420,
    "status": "tentative",
    "venue_id": "E"
  },
  {
    "id": "211",
    "name": "Startup Founders Dinner",
    "date": "2026-11-02",
    "start": "19:00",
    "duration_min": 150,
    "room": "LA-SERRA",
    "format": "networking",
    "attendance_expected": 96,
    "status": "confirmed",
    "venue_id": "K"
  },
  {
    "id": "212",
    "name": "Founder Pitch Night",
    "date": "2026-11-03",
    "start": "17:30",
    "duration_min": 120,
    "room": "STARTUP-VILLAGE",
    "format": "pitch",
    "attendance_expected": 110,
    "status": "confirmed",
    "venue_id": "N"
  },
  {
    "id": "213",
    "name": "Leadership Retreat",
    "date": "2026-11-04",
    "start": "09:00",
    "duration_min": 360,
    "room": "VILLA-ANNIA",
    "format": "retreat",
    "attendance_expected": 24,
    "status": "tentative",
    "venue_id": "Q"
  }
]

export const rooms = [
  {
    "id": "B3-201",
    "building": "B3",
    "floor": 2,
    "capacity": 60,
    "accessibility": true,
    "equipment": [
      "projector",
      "hybrid-camera",
      "whiteboard"
    ],
    "status": "available"
  },
  {
    "id": "B3-202",
    "building": "B3",
    "floor": 2,
    "capacity": 120,
    "accessibility": true,
    "equipment": [
      "projector",
      "hybrid-camera",
      "stage",
      "whiteboard"
    ],
    "status": "available"
  },
  {
    "id": "B3-203",
    "building": "B3",
    "floor": 2,
    "capacity": 80,
    "accessibility": false,
    "equipment": [
      "projector",
      "sound-system",
      "whiteboard"
    ],
    "status": "available"
  },
  {
    "id": "B2-104",
    "building": "B2",
    "floor": 1,
    "capacity": 36,
    "accessibility": true,
    "equipment": [
      "whiteboard",
      "video-conference"
    ],
    "status": "available"
  }
]

export const bookings = [
  {
    "id": "BK-204",
    "event_id": "204",
    "room": "B3-201",
    "date": "2026-10-31",
    "start": "15:00",
    "end": "16:30",
    "status": "confirmed"
  },
  {
    "id": "BK-205",
    "event_id": "205",
    "room": "B3-201",
    "date": "2026-10-31",
    "start": "17:00",
    "end": "19:00",
    "status": "confirmed"
  },
  {
    "id": "BK-206",
    "event_id": "206",
    "room": "B3-203",
    "date": "2026-10-31",
    "start": "18:00",
    "end": "19:30",
    "status": "confirmed"
  },
  {
    "id": "BK-207",
    "event_id": "207",
    "room": "B3-202",
    "date": "2026-11-01",
    "start": "09:30",
    "end": "11:30",
    "status": "confirmed"
  },
  {
    "id": "BK-208",
    "event_id": "208",
    "room": "B3-201",
    "date": "2026-11-01",
    "start": "11:00",
    "end": "12:00",
    "status": "confirmed"
  },
  {
    "id": "BK-209",
    "event_id": "209",
    "room": "B3-202",
    "date": "2026-11-01",
    "start": "14:00",
    "end": "15:30",
    "status": "tentative"
  }
]

export const resources = [
  {
    "id": "R-001",
    "name": "portable projector",
    "quantity": 2,
    "available": 1
  },
  {
    "id": "R-002",
    "name": "hybrid camera kit",
    "quantity": 2,
    "available": 1
  },
  {
    "id": "R-003",
    "name": "wireless microphone set",
    "quantity": 3,
    "available": 2
  },
  {
    "id": "R-004",
    "name": "accessible seating kit",
    "quantity": 4,
    "available": 4
  }
]

export const changeRequests = [
  {
    "id": "CR-001",
    "channel": "email",
    "language": "it",
    "event_id": "204",
    "gold_outcome": "valid_change"
  },
  {
    "id": "CR-002",
    "channel": "slack",
    "language": "en",
    "event_id": "207",
    "gold_outcome": "valid_change"
  },
  {
    "id": "CR-003",
    "channel": "forwarded_email",
    "language": "it",
    "event_id": "208",
    "gold_outcome": "human_review"
  },
  {
    "id": "CR-004",
    "channel": "whatsapp",
    "language": "it",
    "event_id": "204",
    "gold_outcome": "human_review"
  },
  {
    "id": "CR-005",
    "channel": "email",
    "language": "en",
    "event_id": null,
    "gold_outcome": "human_review"
  },
  {
    "id": "CR-006",
    "channel": "calendar_comment",
    "language": "it",
    "event_id": "204",
    "gold_outcome": "human_review"
  },
  {
    "id": "CR-007",
    "channel": "email",
    "language": "en",
    "event_id": "208",
    "gold_outcome": "valid_change"
  },
  {
    "id": "CR-008",
    "channel": "slack",
    "language": "it",
    "event_id": "209",
    "gold_outcome": "no_time_change"
  }
]

export const buildings = [
  {
    "id": "A",
    "name": "Welcome Center",
    "category": "visitor_services",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "B",
    "name": "EYU & PYP Programmes",
    "category": "education",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "C",
    "name": "MYP Programme",
    "category": "education",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "D",
    "name": "University Programme",
    "category": "education",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "E",
    "name": "The Hill",
    "category": "events_and_library",
    "campus_zone": "main campus",
    "capacity_note": "Public campus page describes a 700-seat conference hall and library",
    "confidence": "observed"
  },
  {
    "id": "F",
    "name": "Amor Bistrò",
    "category": "food_and_hospitality",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "G",
    "name": "Boarding Houses",
    "category": "accommodation",
    "campus_zone": "main campus",
    "capacity_note": "Public summer academy page describes two residential buildings and up to 220 beds",
    "confidence": "observed"
  },
  {
    "id": "H",
    "name": "AKQA",
    "category": "company_space",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "I",
    "name": "SHADO Studios",
    "category": "media_and_production",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "J",
    "name": "Consultancy Area",
    "category": "company_space",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "K",
    "name": "La Serra Restaurant",
    "category": "food_and_events",
    "campus_zone": "main campus",
    "capacity_note": "Public campus page describes a greenhouse used as restaurant, bar, coworking and meeting place",
    "confidence": "observed"
  },
  {
    "id": "L",
    "name": "H-FARM HQ",
    "category": "offices",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "M",
    "name": "VAIA Building",
    "category": "education_and_offices",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "N",
    "name": "Startup Village & Entrepreneurship Center",
    "category": "startups_and_innovation",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "O",
    "name": "Science Labs",
    "category": "labs",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "P",
    "name": "Diploma Programme",
    "category": "education",
    "campus_zone": "main campus",
    "confidence": "observed"
  },
  {
    "id": "Q",
    "name": "Villa Annia Guest House",
    "category": "hospitality_and_events",
    "campus_zone": "main campus",
    "capacity_note": "Public business school page describes 16 rooms and spaces for events and corporate meetings",
    "confidence": "observed"
  },
  {
    "id": "SPORTS",
    "name": "Sports Area",
    "category": "sports",
    "campus_zone": "campus grounds",
    "capacity_note": "Public campus pages describe 5,000 m² outdoor and 1,600 m² covered sports space",
    "confidence": "observed"
  },
  {
    "id": "MARINA",
    "name": "H-FARM Campus Marina",
    "category": "marina_and_hospitality",
    "campus_zone": "Portegrandi",
    "confidence": "observed"
  }
]

export const venueProfiles = [
  {
    "venue_id": "E",
    "venue_name": "The Hill",
    "event_types": [
      "conference",
      "lecture",
      "graduation",
      "town_hall"
    ],
    "capacity_range": [
      50,
      700
    ],
    "requirements": [
      "seating",
      "presentation",
      "accessible_access"
    ]
  },
  {
    "venue_id": "K",
    "venue_name": "La Serra Restaurant",
    "event_types": [
      "dinner",
      "networking",
      "private_event",
      "coworking"
    ],
    "capacity_range": [
      10,
      180
    ],
    "requirements": [
      "catering",
      "flexible_layout"
    ]
  },
  {
    "venue_id": "N",
    "venue_name": "Startup Village & Entrepreneurship Center",
    "event_types": [
      "pitch",
      "workshop",
      "startup_meetup",
      "office_hours"
    ],
    "capacity_range": [
      10,
      150
    ],
    "requirements": [
      "presentation",
      "wifi",
      "hybrid_video"
    ]
  },
  {
    "venue_id": "Q",
    "venue_name": "Villa Annia Guest House",
    "event_types": [
      "executive_meeting",
      "retreat",
      "corporate_event"
    ],
    "capacity_range": [
      6,
      80
    ],
    "requirements": [
      "catering",
      "parking",
      "quiet_space"
    ]
  },
  {
    "venue_id": "SPORTS",
    "venue_name": "Sports Area",
    "event_types": [
      "sports",
      "team_building",
      "outdoor_activity"
    ],
    "capacity_range": [
      10,
      500
    ],
    "requirements": [
      "outdoor_space",
      "safety_staff"
    ]
  },
  {
    "venue_id": "D",
    "venue_name": "University Programme",
    "event_types": [
      "class",
      "seminar",
      "orientation",
      "roundtable"
    ],
    "capacity_range": [
      10,
      120
    ],
    "requirements": [
      "seating",
      "presentation",
      "wifi"
    ]
  }
]

export const organizations = [
  {
    "id": "ORG-COLLEGE",
    "name": "H-FARM College",
    "type": "education"
  },
  {
    "id": "ORG-BS",
    "name": "H-FARM Business School",
    "type": "education"
  },
  {
    "id": "ORG-STARTUP",
    "name": "Entrepreneurship & Startup Center",
    "type": "innovation"
  },
  {
    "id": "ORG-CAMPUS",
    "name": "Campus Operations",
    "type": "operations"
  },
  {
    "id": "ORG-COMMUNITY",
    "name": "Community Programs",
    "type": "events"
  }
]

export const people = [
  {
    "id": "P-001",
    "role": "Event Operations Manager",
    "organization_id": "ORG-COMMUNITY",
    "can_ingest": true,
    "can_approve": false
  },
  {
    "id": "P-002",
    "role": "Space Coordinator",
    "organization_id": "ORG-CAMPUS",
    "can_ingest": false,
    "can_approve": true
  },
  {
    "id": "P-003",
    "role": "Administrator",
    "organization_id": "ORG-CAMPUS",
    "can_ingest": false,
    "can_approve": false,
    "can_view_audit": true
  },
  {
    "id": "P-004",
    "role": "Programme Lead",
    "organization_id": "ORG-COLLEGE",
    "can_ingest": true,
    "can_approve": false
  }
]

export const participants = [
  {
    "id": "ATT-204-01",
    "event_id": "204",
    "language": "it",
    "attendance": "registered",
    "consent_email": true
  },
  {
    "id": "ATT-204-02",
    "event_id": "204",
    "language": "it",
    "attendance": "registered",
    "consent_email": true
  },
  {
    "id": "ATT-204-03",
    "event_id": "204",
    "language": "en",
    "attendance": "registered",
    "consent_email": true
  },
  {
    "id": "ATT-204-04",
    "event_id": "204",
    "language": "en",
    "attendance": "waitlist",
    "consent_email": true
  },
  {
    "id": "ATT-205-01",
    "event_id": "205",
    "language": "it",
    "attendance": "registered",
    "consent_email": true
  },
  {
    "id": "ATT-205-02",
    "event_id": "205",
    "language": "en",
    "attendance": "registered",
    "consent_email": true
  },
  {
    "id": "ATT-212-01",
    "event_id": "212",
    "language": "it",
    "attendance": "registered",
    "consent_email": true
  }
]

export const notificationTemplates = [
  {
    "id": "TPL-ROOM-CHANGE-IT",
    "event_type": "room_change",
    "language": "it",
    "channel": "email",
    "subject": "Aggiornamento evento {{event_name}}",
    "body": "Ciao {{participant_name}}, l'evento {{event_name}} del {{date}} inizierà alle {{start}} nella sala {{room}}. Durata: {{duration_min}} minuti. Questa è una comunicazione demo."
  },
  {
    "id": "TPL-ROOM-CHANGE-EN",
    "event_type": "room_change",
    "language": "en",
    "channel": "email",
    "subject": "Event update: {{event_name}}",
    "body": "Hi {{participant_name}}, {{event_name}} on {{date}} will start at {{start}} in room {{room}}. Duration: {{duration_min}} minutes. This is a demo notification."
  }
]

export const maintenanceWindows = [
  {
    "id": "MW-001",
    "date": "2026-10-31",
    "start": "12:00",
    "end": "13:00",
    "building_id": "K",
    "reason": "catering delivery and kitchen reset",
    "blocks_event": false
  },
  {
    "id": "MW-002",
    "date": "2026-11-01",
    "start": "08:00",
    "end": "10:30",
    "building_id": "SPORTS",
    "reason": "field safety inspection",
    "blocks_event": true
  },
  {
    "id": "MW-003",
    "date": "2026-11-02",
    "start": "08:00",
    "end": "09:00",
    "building_id": "E",
    "reason": "AV system test",
    "blocks_event": false
  },
  {
    "id": "MW-004",
    "date": "2026-11-04",
    "start": "13:00",
    "end": "15:00",
    "building_id": "Q",
    "reason": "guest house housekeeping turnover",
    "blocks_event": true
  }
]

export const policies = [
  {
    "id": "POL-001",
    "name": "booking_write_requires_approval",
    "scope": "room_booking",
    "rule": "Only Space Coordinator may approve a booking change",
    "on_violation": "human_review"
  },
  {
    "id": "POL-002",
    "name": "capacity_guard",
    "scope": "venue_assignment",
    "rule": "attendance_expected must be <= venue capacity",
    "on_violation": "reject_candidate"
  },
  {
    "id": "POL-003",
    "name": "maintenance_guard",
    "scope": "venue_assignment",
    "rule": "Do not assign a venue during a blocking maintenance window",
    "on_violation": "human_review"
  },
  {
    "id": "POL-004",
    "name": "evidence_required",
    "scope": "llm_extraction",
    "rule": "Every extracted field must be supported by source evidence or remain null",
    "on_violation": "human_review"
  }
]

export const sourceMessages = [
  {
    "id": "MSG-001",
    "channel": "email",
    "language": "it",
    "event_id": "204",
    "expected_outcome": "valid_change"
  },
  {
    "id": "MSG-002",
    "channel": "slack",
    "language": "en",
    "event_id": "212",
    "expected_outcome": "valid_change"
  },
  {
    "id": "MSG-003",
    "channel": "whatsapp",
    "language": "it",
    "event_id": "209",
    "expected_outcome": "human_review"
  },
  {
    "id": "MSG-004",
    "channel": "calendar_forward",
    "language": "en",
    "event_id": "213",
    "expected_outcome": "no_time_change"
  }
]

export const auditLog = []
