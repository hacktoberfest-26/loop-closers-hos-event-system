import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { staticRequest } from './staticDemo'
import eventsData from '../../data/events.json'
import bookingsData from '../../data/bookings.json'
import roomsData from '../../data/rooms.json'
import participantsData from '../../data/participants.json'

const demoNotice = 'Il workshop AI #204 è stato spostato dalle 15:00 alle 17:30 del 31 ottobre. La durata rimane di 90 minuti.'
const roles = ['Event Operations Manager', 'Space Coordinator', 'Administrator']
const datasets = ['events', 'rooms', 'bookings', 'resources', 'change_requests', 'buildings', 'venue_profiles', 'organizations', 'people', 'participants', 'notification_templates', 'maintenance_windows', 'policies', 'source_messages']
const staticDemo = import.meta.env.VITE_STATIC_DEMO === 'true'
const asset = name => `${import.meta.env.BASE_URL}${name}`
const demoEvent = eventsData.find(item => item.id === '204')
const demoConflict = eventsData.find(item => item.id === '205')
const demoBooking = bookingsData.find(item => item.event_id === '205')
const demoAlternative = roomsData.find(item => item.id === 'B3-202')
const demoParticipants = participantsData.filter(item => item.event_id === '204' && item.consent_email)
const demoScenario = {
  event: demoEvent,
  conflict: demoConflict,
  booking: demoBooking,
  alternative: demoAlternative,
  participantCount: demoParticipants.length,
}
const clearEvent = eventsData.find(item => item.id === '209')
const scenarios = [
  {
    id: 'room-conflict',
    label: 'Conflitto con alternativa',
    description: 'La sala è occupata, ma il sistema trova una soluzione.',
    notice: demoNotice,
    facts: [
      ['Nuovo orario', `${demoScenario.event.date} · 17:30–19:00`],
      ['Sala attuale', demoScenario.event.room],
      ['Conflitto', `#${demoScenario.conflict.id} · ${demoScenario.booking.start}–${demoScenario.booking.end}`],
      ['Alternativa', `${demoScenario.alternative.id} · ${demoScenario.alternative.capacity} posti`],
      ['Partecipanti', `${demoScenario.participantCount} con consenso email`],
    ],
  },
  {
    id: 'room-clear',
    label: 'Nessun conflitto',
    description: 'Il nuovo orario è libero e la sala può restare la stessa.',
    notice: `Il ${clearEvent.name} #${clearEvent.id} è stato spostato dalle 14:00 alle 16:00 del 1 novembre. La durata rimane di ${clearEvent.duration_min} minuti.`,
    facts: [
      ['Nuovo orario', `${clearEvent.date} · 16:00–17:30`],
      ['Sala attuale', clearEvent.room],
      ['Conflitto', 'Nessuno'],
      ['Azione', 'Conferma stessa sala'],
      ['Stato', 'Richiede approvazione'],
    ],
  },
  {
    id: 'human-review',
    label: 'Richiesta incompleta',
    description: 'Manca un orario verificabile: H-OS chiede una conferma.',
    notice: 'Il workshop AI #204 è stato spostato più tardi il 31 ottobre. La durata rimane di 90 minuti.',
    facts: [
      ['Evento', 'AI Workshop #204'],
      ['Nuovo orario', 'Non specificato'],
      ['Sala', 'Da verificare'],
      ['Esito', 'Revisione umana'],
      ['Azione', 'Chiedi conferma'],
    ],
  },
  {
    id: 'no-alternative',
    label: 'Conflitto senza alternativa',
    description: 'Il conflitto esiste, ma nessuna sala soddisfa i vincoli.',
    scenarioId: 'no-alternative',
    notice: demoNotice,
    facts: [
      ['Nuovo orario', `${demoScenario.event.date} · 17:30–19:00`],
      ['Sala attuale', demoScenario.event.room],
      ['Conflitto', `#${demoScenario.conflict.id} · ${demoScenario.booking.start}–${demoScenario.booking.end}`],
      ['Alternativa', 'Nessuna disponibile'],
      ['Azione', 'Pianificazione manuale'],
    ],
  },
]

async function request(path, role, options = {}) {
  if (staticDemo) return staticRequest(path, role, options)
  const response = await fetch(`/api/${path}`, { ...options, headers: { 'Content-Type': 'application/json', 'X-Demo-Role': role, ...(options.headers || {}) } })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

const initialMessages = [
  {
    id: 'welcome',
    actor: 'assistant',
    text: 'Ciao, sono Event Coordinator, la vertical slice operativa di H-OS. Incolla qui una comunicazione su un cambio di evento e ti dirò cosa controllare, perché e quale decisione serve.',
    detail: 'Non modifico prenotazioni reali. Ogni azione resta una simulazione verificabile.',
  },
]

function Badge({ children, tone = 'neutral' }) { return <span className={`badge ${tone}`}>{children}</span> }
function InfoRow({ label, value, tone = '' }) { return <div className="info-row"><span>{label}</span><strong className={tone}>{value}</strong></div> }

function ScenarioCard({ scenario, onChange, onRun, busy }) {
  return <section className="context-card scenario-card" aria-label="Scenario sintetico della demo">
    <div className="context-heading"><span>SCENARIO SINTETICO</span><Badge tone="blue">Dati demo</Badge></div>
    <label className="scenario-select" htmlFor="scenario"><span>Scegli un percorso</span><select id="scenario" value={scenario.id} onChange={event => onChange(event.target.value)} disabled={busy}>{scenarios.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    <h2>{scenario.label}</h2>
    <p>{scenario.description}</p>
    <div className="scenario-grid">{scenario.facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <button className="scenario-button" type="button" onClick={onRun} disabled={busy}>Avvia simulazione <span aria-hidden="true">↗</span></button>
    <small className="scenario-note">La simulazione si ferma prima dell’approvazione umana.</small>
  </section>
}

function ChatMessage({ message }) {
  const assistant = message.actor === 'assistant'
  return <div className={`chat-message ${assistant ? 'assistant' : 'user'}`}>
    <div className="message-avatar" aria-hidden="true">{assistant ? <img src={asset('hos-mark.svg')} alt="" /> : 'Tu'}</div>
    <div className="message-content">
      <span className="message-author">{assistant ? 'H-OS' : 'Tu'}</span>
      <div className="message-bubble"><p>{message.text}</p>{message.detail && <small>{message.detail}</small>}</div>
    </div>
  </div>
}

function ResultBlock({ pending, role, busy, decide, communication, previewCommunication, sendCommunication }) {
  if (!pending) return null
  if (pending.status === 'human_review') {
    return <section className="result-block review-block" aria-label="Revisione umana richiesta">
      <div className="result-heading"><span className="result-icon">?</span><div><span className="result-label">Serve una verifica</span><h2>Non posso procedere automaticamente.</h2></div></div>
      <p>{pending.reason || 'Manca un’informazione verificabile nella richiesta.'}</p>
      <small>Controlla il messaggio, aggiungi il dato mancante e invialo di nuovo.</small>
    </section>
  }

  const conflict = pending.conflicts?.length > 0
  const noAlternative = conflict && !pending.suggested_room
  const currentRoom = pending.original_room || pending.change?.room
  const proposedRoom = conflict ? pending.suggested_room : currentRoom
  const approved = pending.status === 'approved_and_applied_mock'

  return <section className={`result-block ${conflict ? 'conflict-block' : 'clear-block'}`} aria-label="Risultato del controllo">
    <div className="result-heading"><span className="result-icon">{approved ? '✓' : conflict ? '!' : '✓'}</span><div><span className="result-label">{approved ? 'Modifica registrata nella demo' : conflict ? 'Conflitto rilevato' : 'Nessun conflitto rilevato'}</span><h2>{approved ? 'La nuova prenotazione è pronta.' : conflict ? 'La sala attuale è occupata.' : 'La sala può restare la stessa.'}</h2></div></div>
    {pending.change && <div className="extracted-data"><div><span>Evento</span><strong>#{pending.change.event_id}</strong></div><div><span>Data</span><strong>{pending.change.date}</strong></div><div><span>Ora</span><strong>{pending.change.start}</strong></div><div><span>Durata</span><strong>{pending.change.duration_min} min</strong></div></div>}
    {conflict && <div className="result-callout"><strong>La sala {currentRoom} è già occupata dall’evento #{pending.conflicts.join(', #')}.</strong><span>{noAlternative ? 'Nessuna sala disponibile soddisfa i vincoli.' : <>Alternativa proposta: <b>{proposedRoom}</b>.</>}</span></div>}
    {!conflict && !approved && <div className="result-callout success"><strong>{currentRoom || 'La sala attuale'} è disponibile nel nuovo intervallo.</strong><span>Il coordinatore può confermare il cambio.</span></div>}
    {approved && <div className="result-callout success"><strong>La modifica mock è stata applicata a {proposedRoom}.</strong><span>Ora puoi preparare una comunicazione per i partecipanti.</span></div>}

    {pending.status === 'approval_required' && <div className="result-actions"><p>{noAlternative ? 'Serve una pianificazione manuale: non è possibile approvare in sicurezza.' : 'La decisione resta umana: solo Space Coordinator può confermare.'}</p><div className="button-row"><button className="primary" onClick={() => decide(true)} disabled={busy || role !== 'Space Coordinator' || noAlternative}>Conferma modifica</button><button onClick={() => decide(false)} disabled={busy || role !== 'Space Coordinator'}>Rifiuta</button></div>{role !== 'Space Coordinator' && <small className="role-hint">Seleziona “Space Coordinator” in alto per decidere.</small>}{noAlternative && role === 'Space Coordinator' && <small className="role-hint">Nessuna approvazione disponibile: aggiungi una sala o modifica i vincoli.</small>}</div>}
    {approved && <div className="result-actions"><div className="button-row"><button className="primary" onClick={previewCommunication} disabled={busy}>Prepara messaggio</button>{communication && <button onClick={sendCommunication} disabled={busy || role !== 'Space Coordinator'}>Registra invio demo</button>}</div>{role !== 'Space Coordinator' && <small className="role-hint">Per registrare l’invio devi essere Space Coordinator.</small>}{communication && <div className="message-preview"><div><span>Destinatari</span><strong>{communication.recipient_count} partecipanti</strong></div><div><span>Oggetto</span><strong>{communication.message.subject}</strong></div><p>{communication.message.body}</p><Badge tone={communication.status === 'mock_sent' ? 'green' : 'blue'}>{communication.status === 'mock_sent' ? 'Invio registrato' : 'Anteprima'}</Badge></div>}</div>}
  </section>
}

function App() {
  const [role, setRole] = useState(roles[0])
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0].id)
  const [notice, setNotice] = useState(demoNotice)
  const [health, setHealth] = useState({ mode: 'baseline' })
  const [quality, setQuality] = useState({ status: 'unknown' })
  const [state, setState] = useState({ events: [], pending: null, source_count: 0, audit: [] })
  const [result, setResult] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState('events')
  const [datasetRows, setDatasetRows] = useState([])
  const [communication, setCommunication] = useState(null)
  const [messages, setMessages] = useState(initialMessages)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const selectedScenario = scenarios.find(item => item.id === selectedScenarioId) || scenarios[0]
  const pending = result?.pending ?? state.pending
  const needsManualPlan = pending?.status === 'approval_required' && pending.conflicts?.length > 0 && !pending.suggested_room
  const modelLabel = health.mode === 'google' ? 'Gemma 4 · Google API' : health.mode === 'backboard' ? 'Gemma 4 · modello online' : health.mode === 'gemma' ? 'Gemma 4 · modello locale' : 'Simulazione controllata'
  const stateLabel = pending?.status === 'human_review' ? 'Revisione richiesta' : needsManualPlan ? 'Pianificazione richiesta' : pending?.status === 'approval_required' ? 'Decisione richiesta' : pending?.status === 'approved_and_applied_mock' ? 'Completato' : 'In attesa di un messaggio'
  const stateTone = pending?.status === 'human_review' || needsManualPlan ? 'amber' : pending?.status === 'approval_required' ? 'blue' : pending?.status === 'approved_and_applied_mock' ? 'green' : 'neutral'

  async function refresh() {
    try {
      const [h, s, q] = await Promise.all([request('health', role), request('state', role), request('data-quality', role)])
      setHealth(h); setState(s); setResult(s); setQuality(q); setError('')
    } catch (e) { setError(e.message) }
  }

  async function loadDataset(name) {
    setSelectedDataset(name)
    try { setDatasetRows((await request(`datasets/${name}`, role)).items); setError('') } catch (e) { setError(e.message) }
  }

  async function resetEngine(actorRole = role) {
    const data = await request('reset', actorRole, { method: 'POST', body: JSON.stringify({}) })
    setResult(data); setState(data); setCommunication(null); setMessages(initialMessages)
    return data
  }

  async function chooseScenario(id) {
    const next = scenarios.find(item => item.id === id) || scenarios[0]
    setBusy(true); setFeedback(''); setError('')
    try {
      await resetEngine(role)
      setSelectedScenarioId(next.id); setNotice(next.notice); setFeedback('Scenario pronto')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function analyseNotice(submitted, actorRole = role) {
    if (!submitted) return
    setBusy(true); setFeedback(''); setError('')
    try {
      const scenarioId = selectedScenarioId === 'no-alternative' ? 'no-alternative' : undefined
      const data = await request('ingest', actorRole, { method: 'POST', body: JSON.stringify({ notice: submitted, scenario_id: scenarioId }) })
      setResult(data); setState(data)
      const next = data.pending?.status === 'human_review'
        ? { text: 'Ho bisogno di una verifica umana prima di procedere.', detail: data.pending.reason }
        : data.pending?.conflicts?.length && !data.pending?.suggested_room
          ? { text: 'Ho trovato un conflitto, ma nessuna sala rispetta i vincoli.', detail: 'Serve una pianificazione manuale prima di poter approvare.' }
          : data.pending?.conflicts?.length
          ? { text: 'Ho trovato un conflitto di sala e una possibile alternativa.', detail: `La sala ${data.pending.original_room} è occupata. Controlla il risultato qui sotto.` }
          : { text: 'Ho controllato il nuovo orario: non risultano conflitti.', detail: 'La sala attuale può restare la stessa, ma la modifica richiede comunque approvazione.' }
      setMessages(previous => [...previous, { id: `user-${Date.now()}`, actor: 'user', text: submitted }, { id: `assistant-${Date.now()}`, actor: 'assistant', ...next }])
      setFeedback('Analisi completata')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function analyse(event) {
    event?.preventDefault()
    await analyseNotice(notice.trim())
  }

  async function runSimulation() {
    setRole(roles[0])
    setNotice(selectedScenario.notice)
    await resetEngine(roles[0])
    await analyseNotice(selectedScenario.notice, roles[0])
  }

  async function decide(approve) {
    setBusy(true); setFeedback(''); setError('')
    try {
      const data = await request('decide', role, { method: 'POST', body: JSON.stringify({ approve }) })
      setResult(data); setState(data); setFeedback(approve ? 'Modifica mock confermata' : 'Modifica rifiutata')
      setMessages(previous => [...previous, { id: `assistant-${Date.now()}`, actor: 'assistant', text: approve ? 'La modifica è stata confermata e registrata nella demo.' : 'La modifica è stata rifiutata. Nessun dato operativo è stato cambiato.' }])
      await loadDataset('bookings')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function previewCommunication() {
    setBusy(true); setFeedback(''); setError('')
    try { setCommunication(await request('communications/preview', role, { method: 'POST', body: JSON.stringify({ event_id: pending?.change?.event_id }) })); setFeedback('Anteprima pronta') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function sendCommunication() {
    setBusy(true); setFeedback(''); setError('')
    try { setCommunication(await request('communications/send', role, { method: 'POST', body: JSON.stringify({ event_id: pending?.change?.event_id }) })); setFeedback('Invio demo registrato') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function resetDemo() {
    setBusy(true); setFeedback(''); setError('')
    try {
      const data = await resetEngine(role)
      setRole(roles[0]); setSelectedScenarioId(scenarios[0].id); setResult(data); setState(data); setNotice(scenarios[0].notice); setFeedback('Nuova sessione pronta')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  useEffect(() => { refresh(); loadDataset('events') }, [role])

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Salta al contenuto principale</a>
    <header className="app-header">
      <a className="brand" href="#main-content" aria-label="H-OS Event Coordinator"><span className="brand-mark"><img src={asset('hos-mark.svg')} alt="" aria-hidden="true" /></span><span>H-OS</span><span className="brand-divider">/</span><span className="brand-product">Event Coordinator</span></a>
      <div className="header-actions"><span className="live-status"><i /> Demo attiva</span><label className="role-picker"><span>Ruolo</span><select value={role} onChange={event => setRole(event.target.value)} aria-label="Ruolo operativo">{roles.map(item => <option key={item}>{item}</option>)}</select></label><button className="quiet-button" type="button" onClick={resetDemo} disabled={busy}>Nuova sessione</button></div>
    </header>

    <main id="main-content" className="app-main">
      <section className="product-intro"><div><span className="eyebrow">H-OS · VERTICAL SLICE</span><h1>Event Coordinator.<br /><em>Capisci cosa fare.</em></h1><p>Una vertical slice di H-OS: incolla un cambio di evento, controlla la sala e arriva alla decisione in pochi secondi.</p></div><div className="intro-note"><Badge tone="green">Privacy first</Badge><span>Dati sintetici · nessuna prenotazione reale</span></div></section>

      <div className="workspace-grid">
        <section className="chat-panel" aria-label="Conversazione con Event Coordinator">
          <div className="chat-header"><div><span className="overline">EVENT COORDINATOR</span><h2>Controllo cambio evento</h2></div><Badge tone={health.mode === 'baseline' ? 'neutral' : 'blue'}>{modelLabel}</Badge></div>
          <div className="conversation" aria-live="polite">{messages.map(message => <ChatMessage key={message.id} message={message} />)}<ResultBlock pending={pending} role={role} busy={busy} decide={decide} communication={communication} previewCommunication={previewCommunication} sendCommunication={sendCommunication} /></div>
          <form className="composer" onSubmit={analyse}><label htmlFor="notice">Nuovo messaggio</label><textarea id="notice" value={notice} onChange={event => setNotice(event.target.value)} placeholder="Incolla qui la comunicazione ricevuta…" rows="4" /><div className="composer-footer"><span><span className="lock-dot">⌁</span> Il testo resta nella demo e viene minimizzato prima dell’analisi.</span><button className="primary send-button" type="submit" disabled={busy || role !== roles[0]}>{busy ? 'Analisi…' : 'Analizza messaggio'} <span aria-hidden="true">↗</span></button></div>{role !== roles[0] && <small className="role-hint">Per inviare una richiesta scegli “Event Operations Manager”.</small>}</form>
          <div className="quick-start"><span>Non hai un messaggio?</span><button type="button" onClick={() => setNotice(demoNotice)}>Usa l’esempio della demo</button></div>
        </section>

        <aside className="context-panel" aria-label="Contesto operativo">
          <section className="context-card status-card"><div className="context-heading"><span>STATO</span><Badge tone={stateTone}>{stateLabel}</Badge></div><h2>{needsManualPlan ? 'Serve una soluzione.' : pending?.status === 'approval_required' ? 'Una decisione ti aspetta.' : pending?.status === 'approved_and_applied_mock' ? 'Tutto pronto.' : 'Sono pronto ad aiutarti.'}</h2><p>{needsManualPlan ? 'Nessuna sala disponibile: il caso passa alla pianificazione manuale.' : pending?.status === 'approval_required' ? 'Controlla il conflitto e scegli se confermare la modifica.' : pending?.status === 'approved_and_applied_mock' ? 'La modifica è stata registrata. Puoi avvisare i partecipanti.' : 'Parti da un messaggio ricevuto: il calendario resta sullo sfondo.'}</p></section>
          <ScenarioCard scenario={selectedScenario} onChange={chooseScenario} onRun={runSimulation} busy={busy} />
          <section className="context-card"><div className="context-heading"><span>CONTROLLO</span><span className="check-status"><i /> {quality.status === 'pass' ? 'Dati verificati' : 'In attesa'}</span></div><InfoRow label="Eventi nel catalogo" value={state.events?.length || '—'} /><InfoRow label="Fonti ricevute" value={state.source_count || 0} /><InfoRow label="Modifiche aperte" value={pending?.status === 'approval_required' ? 1 : 0} tone={pending?.status === 'approval_required' ? 'accent' : ''} /></section>
          <details className="context-card details-card"><summary>Privacy e traccia</summary><div className="details-content"><p>Le informazioni vengono usate solo per verificare il cambio. Il modello non autorizza azioni e le comunicazioni sono simulate.</p>{pending?.privacy && <div className="privacy-list"><InfoRow label="Elementi rimossi" value={pending.privacy.redactions} /><InfoRow label="Fonte originale" value="Conservata localmente" /></div>}{state.audit?.length > 0 && <div className="audit-list"><span className="overline">ULTIME ATTIVITÀ</span>{state.audit.slice(-3).reverse().map((entry, index) => <div className="audit-item" key={`${entry.action}-${index}`}><i /><span>{entry.action.replaceAll('_', ' ')}</span></div>)}</div>}</div></details>
          <details className="context-card details-card"><summary>Dati della demo</summary><div className="details-content"><label className="dataset-label" htmlFor="dataset">Dataset</label><select id="dataset" value={selectedDataset} onChange={event => loadDataset(event.target.value)}>{datasets.map(name => <option key={name}>{name}</option>)}</select><div className="table-wrap"><table><caption className="sr-only">Prime righe del dataset {selectedDataset}</caption><thead><tr>{datasetRows[0] && Object.keys(datasetRows[0]).slice(0, 3).map(key => <th scope="col" key={key}>{key.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{datasetRows.slice(0, 4).map((row, index) => <tr key={index}>{Object.keys(datasetRows[0] || {}).slice(0, 3).map(key => <td key={key}>{String(row[key] ?? '—')}</td>)}</tr>)}</tbody></table></div></div></details>
        </aside>
      </div>

      {(feedback || error) && <div className={`feedback ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'} aria-live="polite">{error || feedback}</div>}
      <footer><span>H-OS</span> / Event Coordinator <i>·</i> Demo sintetica <i>·</i> Decisioni sempre umane</footer>
    </main>
  </div>
}

const rootContainer = document.getElementById('root')
const appRoot = window.__HOS_REACT_ROOT || createRoot(rootContainer)
window.__HOS_REACT_ROOT = appRoot
appRoot.render(<App />)
