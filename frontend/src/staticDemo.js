import { events as eventsSeed, rooms, bookings as bookingsSeed, resources, changeRequests, buildings, venueProfiles, organizations, people, participants, notificationTemplates, maintenanceWindows, policies, sourceMessages, auditLog } from './publicDemoData'

const DATE = '2026-10-31'
const roles = {
  ingest: 'Event Operations Manager',
  approve: 'Space Coordinator',
}

const seedDatasets = {
  events: eventsSeed,
  rooms,
  bookings: bookingsSeed,
  resources,
  change_requests: changeRequests,
  buildings,
  venue_profiles: venueProfiles,
  organizations,
  people,
  participants,
  notification_templates: notificationTemplates,
  maintenance_windows: maintenanceWindows,
  policies,
  source_messages: sourceMessages,
  audit_log: auditLog,
}

const clone = value => JSON.parse(JSON.stringify(value))
const publicChange = change => change ? Object.fromEntries(['event_id', 'date', 'start', 'duration_min', 'method'].filter(field => field in change).map(field => [field, change[field]])) : undefined
const publicPending = pending => {
  if (!pending) return null
  const safe = Object.fromEntries(['status', 'reason', 'original_room', 'conflicts', 'suggested_room', 'source_id', 'source_hash', 'privacy'].filter(field => field in pending).map(field => [field, clone(pending[field])]))
  if (pending.change) safe.change = publicChange(pending.change)
  return safe
}
const minute = clock => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

function privacyReport(text) {
  const emails = text.match(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g) || []
  const phones = text.match(/(?<![\d-])(?:\+?\d[\d .()/-]{7,}\d)(?![\d-])/g) || []
  return {
    model_input_minimized: true,
    redactions: emails.length + phones.length,
    raw_source_stored_locally: true,
    model_input_length: text.length - emails.reduce((n, value) => n + value.length - 16, 0) - phones.reduce((n, value) => n + value.length - 17, 0),
  }
}

function extract(text) {
  const eventMatch = text.match(/(?:#|evento\s+|event\s+)(\d{3})\b/i)
  const timeMatch = text.match(/\b(?:alle|to)\s+((?:[01]\d|2[0-3]):[0-5]\d)\b/i)
  const moved = /\b(?:spostat[oa]|posticipat[oa]|rescheduled|moved)\b/i.test(text)
  const negated = /\b(?:non\s+(?:è\s+stato\s+)?spostat[oa]|not\s+(?:been\s+)?rescheduled|not\s+moved)\b/i.test(text)
  if (!eventMatch || !timeMatch || !moved || negated) throw new Error('Not enough evidence to parse this change. Human review required.')
  const event = seedDatasets.events.find(item => String(item.id) === String(eventMatch[1]))
  if (!event) throw new Error('Unknown event, conflicting date or invalid time')
  const durationMatch = text.match(/\b(\d{1,3})\s*(?:minuti|minutes)\b/i)
  return {
    event_id: event.id,
    date: event.date || DATE,
    start: timeMatch[1],
    duration_min: durationMatch ? Number(durationMatch[1]) : event.duration_min,
    method: 'Gemma 4 · simulazione demo',
    evidence: timeMatch[0],
  }
}

function conflicts(events, eventId, date, start, duration, room) {
  const from = minute(start)
  const to = from + duration
  return events.filter(event => event.id !== eventId && event.date === date && event.room === room)
    .filter(event => overlaps(from, to, minute(event.start), minute(event.start) + event.duration_min))
    .map(event => event.id)
}

function roomCanHost(event, date, start, duration, roomId) {
  const room = rooms.find(item => item.id === roomId)
  if (!room || room.status !== 'available' || event.attendance_expected > room.capacity) return false
  const from = minute(start)
  const to = from + duration
  return !maintenanceWindows.some(window => window.blocks_event && window.date === date &&
    (window.building_id === room.building || window.building_id === roomId) &&
    overlaps(from, to, minute(window.start), minute(window.end)))
}

function createEngine() {
  return {
    events: clone(eventsSeed),
    bookings: clone(bookingsSeed),
    pending: null,
    sources: [],
    audit: [],
    notifications: [],
  }
}

let engine = createEngine()

function snapshot(role) {
  const result = {
    role,
    demo_only: true,
    events: clone(engine.events),
    bookings: clone(engine.bookings),
    notifications: clone(engine.notifications),
    pending: publicPending(engine.pending),
    source_count: engine.sources.length,
    data_quality: { status: 'pass', row_count: Object.values(seedDatasets).reduce((sum, rows) => sum + rows.length, 0) },
  }
  if (role === 'Administrator') {
    result.audit = clone(engine.audit)
    result.sources = engine.sources.map(source => ({ id: source.id, sha256_prefix: source.sha256_prefix, text_length: source.text.length }))
  }
  return result
}

function analyse(role, text, scenarioId = null) {
  if (role !== roles.ingest) throw new Error('Only the Event Operations Manager can submit an update')
  if (typeof text !== 'string' || text.length < 15 || text.length > 3000) throw new Error('Notice must be 15–3000 characters')
  const sourceId = `notice-${engine.sources.length + 1}`
  engine.sources.push({ id: sourceId, sha256_prefix: 'static-demo', text })
  try {
    const change = extract(text)
    const event = engine.events.find(item => String(item.id) === String(change.event_id))
    if (!event || String(change.date).trim() !== String(event.date).trim() || !text.includes(change.start)) throw new Error('Missing evidence of the proposed new start time')
    const overlapping = conflicts(engine.events, event.id, change.date, change.start, change.duration_min, event.room)
    const alternatives = rooms.filter(room => {
      const fits = room.id !== event.room && room.status === 'available' && Number(room.capacity) >= Number(event.attendance_expected || 0)
      const from = minute(change.start)
      const to = from + change.duration_min
      const maintenance = maintenanceWindows.some(window => window.blocks_event && window.date === change.date &&
        (window.building_id === room.building || window.building_id === room.id) &&
        overlaps(from, to, minute(window.start), minute(window.end)))
      return fits && !maintenance && !conflicts(engine.events, event.id, change.date, change.start, change.duration_min, room.id).length
    }).map(room => room.id)
    if (scenarioId === 'no-alternative') alternatives.length = 0
    engine.pending = {
      status: 'approval_required',
      change,
      original_room: event.room,
      conflicts: overlapping,
      suggested_room: alternatives[0] || null,
      source_id: sourceId,
      source_hash: 'static-demo',
      privacy: privacyReport(text),
    }
    engine.audit.push({ action: 'impact_analysed', event: event.id, conflicts: overlapping, suggested_room: engine.pending.suggested_room, source: sourceId })
  } catch (error) {
    engine.pending = { status: 'human_review', reason: error.message, source_id: sourceId, privacy: privacyReport(text) }
    engine.audit.push({ action: 'source_requires_review', source: sourceId, reason: error.message })
  }
  return snapshot(role)
}

function decide(role, approve) {
  if (role !== roles.approve) throw new Error('Only the Space Coordinator can approve booking changes')
  if (!engine.pending || engine.pending.status !== 'approval_required') throw new Error('No approvable action')
  if (!approve) {
    engine.pending.status = 'rejected'
    engine.audit.push({ action: 'booking_change_rejected', source: engine.pending.source_id, actor: role })
    return snapshot(role)
  }
  const change = engine.pending.change
  const event = engine.events.find(item => item.id === change.event_id)
  const target = engine.pending.suggested_room || event.room
  if (!target || !roomCanHost(event, change.date, change.start, change.duration_min, target) || conflicts(engine.events, event.id, change.date, change.start, change.duration_min, target).length) {
    throw new Error('No safely available room; approval blocked')
  }
  event.start = change.start
  event.duration_min = change.duration_min
  event.room = target
  const end = minute(change.start) + change.duration_min
  const booking = engine.bookings.find(item => item.event_id === event.id)
  if (booking) {
    booking.start = change.start
    booking.end = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
    booking.room = target
  }
  engine.pending.status = 'approved_and_applied_mock'
  engine.audit.push({ action: 'mock_booking_updated', event: event.id, room: target, start: change.start, source: engine.pending.source_id, actor: role })
  return snapshot(role)
}

function communication(role, eventId, send = false) {
  const event = engine.events.find(item => item.id === String(eventId))
  if (!event) throw new Error('Unknown event')
  if (send && role !== roles.approve) throw new Error('Only the Space Coordinator can send the demo notification')
  const recipients = participants.filter(item => item.event_id === event.id && item.consent_email)
  const preview = {
    event: clone(event),
    recipient_count: recipients.length,
    recipients: recipients.map(item => ({ id: item.id, event_id: item.event_id, language: item.language, attendance: item.attendance, consent_email: item.consent_email })),
    channel: 'email',
    status: send ? 'mock_sent' : 'preview',
    message: {
      subject: `Aggiornamento evento ${event.name}`,
      body: `L'evento ${event.name} del ${event.date} inizierà alle ${event.start} nella sala ${event.room}. Durata: ${event.duration_min} minuti. Questa è una comunicazione demo.`,
    },
  }
  if (send) {
    const notification = { id: `notification-${engine.notifications.length + 1}`, event_id: event.id, channel: 'email', recipient_count: recipients.length, status: 'mock_sent' }
    engine.notifications.push(notification)
    engine.audit.push({ action: 'participant_notification_mock_sent', ...notification, actor: role })
    preview.notification = notification
  }
  return preview
}

export function staticRequest(path, role, options = {}) {
  const method = options.method || 'GET'
  const body = options.body ? JSON.parse(options.body) : {}
  if (method === 'GET' && path === 'health') return { status: 'ok', mode: 'simulation' }
  if (method === 'GET' && path === 'state') return snapshot(role)
  if (method === 'GET' && path === 'data-quality') return { status: 'pass', row_count: Object.values(seedDatasets).reduce((sum, rows) => sum + rows.length, 0) }
  if (method === 'GET' && path.startsWith('datasets/')) {
    const name = path.slice('datasets/'.length)
    if (!seedDatasets[name]) throw new Error('Unknown dataset')
    const rows = name === 'events' ? engine.events : name === 'bookings' ? engine.bookings : seedDatasets[name]
    return { name, items: clone(rows) }
  }
  if (method === 'POST' && path === 'ingest') return analyse(role, body.notice, body.scenario_id)
  if (method === 'POST' && path === 'decide') return decide(role, body.approve)
  if (method === 'POST' && path === 'communications/preview') return communication(role, body.event_id)
  if (method === 'POST' && path === 'communications/send') return communication(role, body.event_id, true)
  if (method === 'POST' && path === 'reset') {
    engine = createEngine()
    return snapshot(role)
  }
  throw new Error('Not found')
}
