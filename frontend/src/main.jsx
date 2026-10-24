import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { staticRequest } from './staticDemo'

const demoNotice = 'Il workshop AI #204 è stato spostato dalle 15:00 alle 17:30 del 31 ottobre. La durata rimane di 90 minuti.'
const roles = ['Event Operations Manager', 'Space Coordinator', 'Administrator']
const datasets = ['events', 'rooms', 'bookings', 'resources', 'change_requests', 'buildings', 'venue_profiles', 'organizations', 'people', 'participants', 'notification_templates', 'maintenance_windows', 'policies', 'source_messages']
const staticDemo = import.meta.env.VITE_STATIC_DEMO === 'true'
const asset = name => `${import.meta.env.BASE_URL}${name}`

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
    text: 'Ciao, sono H-OS. Incolla qui una comunicazione su un cambio di evento e ti dirò cosa controllare, perché e quale decisione serve.',
    detail: 'Non modifico prenotazioni reali. Ogni azione resta una simulazione verificabile.',
  },
]

function Badge({ children, tone = 'neutral' }) { return <span className={`badge ${tone}`}>{children}</span> }
function InfoRow({ label, value, tone = '' }) { return <div className="info-row"><span>{label}</span><strong className={tone}>{value}</strong></div> }

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
  const currentRoom = pending.original_room || pending.change?.room
  const proposedRoom = conflict ? pending.suggested_room : currentRoom
  const approved = pending.status === 'approved_and_applied_mock'

  return <section className={`result-block ${conflict ? 'conflict-block' : 'clear-block'}`} aria-label="Risultato del controllo">
    <div className="result-heading"><span className="result-icon">{approved ? '✓' : conflict ? '!' : '✓'}</span><div><span className="result-label">{approved ? 'Modifica registrata nella demo' : conflict ? 'Conflitto rilevato' : 'Nessun conflitto rilevato'}</span><h2>{approved ? 'La nuova prenotazione è pronta.' : conflict ? 'La sala attuale è occupata.' : 'La sala può restare la stessa.'}</h2></div></div>
    {pending.change && <div className="extracted-data"><div><span>Evento</span><strong>#{pending.change.event_id}</strong></div><div><span>Data</span><strong>{pending.change.date}</strong></div><div><span>Ora</span><strong>{pending.change.start}</strong></div><div><span>Durata</span><strong>{pending.change.duration_min} min</strong></div></div>}
    {conflict && <div className="result-callout"><strong>La sala {currentRoom} è già occupata dall’evento #{pending.conflicts.join(', #')}.</strong><span>Alternativa proposta: <b>{proposedRoom || 'nessuna sala disponibile'}</b>.</span></div>}
    {!conflict && !approved && <div className="result-callout success"><strong>{currentRoom || 'La sala attuale'} è disponibile nel nuovo intervallo.</strong><span>Il coordinatore può confermare il cambio.</span></div>}
    {approved && <div className="result-callout success"><strong>La modifica mock è stata applicata a {proposedRoom}.</strong><span>Ora puoi preparare una comunicazione per i partecipanti.</span></div>}

    {pending.status === 'approval_required' && <div className="result-actions"><p>La decisione resta umana: solo Space Coordinator può confermare.</p><div className="button-row"><button className="primary" onClick={() => decide(true)} disabled={busy || role !== 'Space Coordinator'}>Conferma modifica</button><button onClick={() => decide(false)} disabled={busy || role !== 'Space Coordinator'}>Rifiuta</button></div>{role !== 'Space Coordinator' && <small className="role-hint">Seleziona “Space Coordinator” in alto per decidere.</small>}</div>}
    {approved && <div className="result-actions"><div className="button-row"><button className="primary" onClick={previewCommunication} disabled={busy}>Prepara messaggio</button>{communication && <button onClick={sendCommunication} disabled={busy || role !== 'Space Coordinator'}>Registra invio demo</button>}</div>{role !== 'Space Coordinator' && <small className="role-hint">Per registrare l’invio devi essere Space Coordinator.</small>}{communication && <div className="message-preview"><div><span>Destinatari</span><strong>{communication.recipient_count} partecipanti</strong></div><div><span>Oggetto</span><strong>{communication.message.subject}</strong></div><p>{communication.message.body}</p><Badge tone={communication.status === 'mock_sent' ? 'green' : 'blue'}>{communication.status === 'mock_sent' ? 'Invio registrato' : 'Anteprima'}</Badge></div>}</div>}
  </section>
}

function App() {
  const [role, setRole] = useState(roles[0])
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

  const pending = result?.pending ?? state.pending
  const modelLabel = health.mode === 'google' ? 'Gemma 4 · Google API' : health.mode === 'backboard' ? 'Gemma 4 · modello online' : health.mode === 'gemma' ? 'Gemma 4 · modello locale' : 'Simulazione controllata'
  const stateLabel = pending?.status === 'human_review' ? 'Revisione richiesta' : pending?.status === 'approval_required' ? 'Decisione richiesta' : pending?.status === 'approved_and_applied_mock' ? 'Completato' : 'In attesa di un messaggio'
  const stateTone = pending?.status === 'human_review' ? 'amber' : pending?.status === 'approval_required' ? 'blue' : pending?.status === 'approved_and_applied_mock' ? 'green' : 'neutral'

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

  async function analyse(event) {
    event?.preventDefault()
    const submitted = notice.trim()
    if (!submitted) return
    setBusy(true); setFeedback(''); setError('')
    try {
      const data = await request('ingest', role, { method: 'POST', body: JSON.stringify({ notice: submitted }) })
      setResult(data); setState(data)
      const next = data.pending?.status === 'human_review'
        ? { text: 'Ho bisogno di una verifica umana prima di procedere.', detail: data.pending.reason }
        : data.pending?.conflicts?.length
          ? { text: 'Ho trovato un conflitto di sala e una possibile alternativa.', detail: `La sala ${data.pending.original_room} è occupata. Controlla il risultato qui sotto.` }
          : { text: 'Ho controllato il nuovo orario: non risultano conflitti.', detail: 'La sala attuale può restare la stessa, ma la modifica richiede comunque approvazione.' }
      setMessages(previous => [...previous, { id: `user-${Date.now()}`, actor: 'user', text: submitted }, { id: `assistant-${Date.now()}`, actor: 'assistant', ...next }])
      setFeedback('Analisi completata')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
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
      const data = await request('reset', role, { method: 'POST', body: JSON.stringify({}) })
      setRole(roles[0]); setResult(data); setState(data); setCommunication(null); setNotice(demoNotice); setMessages(initialMessages); setFeedback('Nuova sessione pronta')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  useEffect(() => { refresh(); loadDataset('events') }, [role])

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Salta al contenuto principale</a>
    <header className="app-header">
      <a className="brand" href="#main-content" aria-label="H-OS Controllo eventi"><span className="brand-mark"><img src={asset('hos-mark.svg')} alt="" aria-hidden="true" /></span><span>H-OS</span><span className="brand-divider">/</span><span className="brand-product">Controllo eventi</span></a>
      <div className="header-actions"><span className="live-status"><i /> Demo attiva</span><label className="role-picker"><span>Ruolo</span><select value={role} onChange={event => setRole(event.target.value)} aria-label="Ruolo operativo">{roles.map(item => <option key={item}>{item}</option>)}</select></label><button className="quiet-button" type="button" onClick={resetDemo} disabled={busy}>Nuova sessione</button></div>
    </header>

    <main id="main-content" className="app-main">
      <section className="product-intro"><div><span className="eyebrow">ASSISTENTE OPERATIVO</span><h1>Capisci cosa fare.<br /><em>In pochi secondi.</em></h1><p>Incolla un cambio di evento. H-OS legge il messaggio, controlla la sala e ti accompagna fino alla decisione.</p></div><div className="intro-note"><Badge tone="green">Privacy first</Badge><span>Dati sintetici · nessuna prenotazione reale</span></div></section>

      <div className="workspace-grid">
        <section className="chat-panel" aria-label="Conversazione con H-OS">
          <div className="chat-header"><div><span className="overline">CONVERSAZIONE</span><h2>Controllo cambio evento</h2></div><Badge tone={health.mode === 'baseline' ? 'neutral' : 'blue'}>{modelLabel}</Badge></div>
          <div className="conversation" aria-live="polite">{messages.map(message => <ChatMessage key={message.id} message={message} />)}<ResultBlock pending={pending} role={role} busy={busy} decide={decide} communication={communication} previewCommunication={previewCommunication} sendCommunication={sendCommunication} /></div>
          <form className="composer" onSubmit={analyse}><label htmlFor="notice">Nuovo messaggio</label><textarea id="notice" value={notice} onChange={event => setNotice(event.target.value)} placeholder="Incolla qui la comunicazione ricevuta…" rows="4" /><div className="composer-footer"><span><span className="lock-dot">⌁</span> Il testo resta nella demo e viene minimizzato prima dell’analisi.</span><button className="primary send-button" type="submit" disabled={busy || role !== roles[0]}>{busy ? 'Analisi…' : 'Analizza messaggio'} <span aria-hidden="true">↗</span></button></div>{role !== roles[0] && <small className="role-hint">Per inviare una richiesta scegli “Event Operations Manager”.</small>}</form>
          <div className="quick-start"><span>Non hai un messaggio?</span><button type="button" onClick={() => setNotice(demoNotice)}>Usa l’esempio della demo</button></div>
        </section>

        <aside className="context-panel" aria-label="Contesto operativo">
          <section className="context-card status-card"><div className="context-heading"><span>STATO</span><Badge tone={stateTone}>{stateLabel}</Badge></div><h2>{pending?.status === 'approval_required' ? 'Una decisione ti aspetta.' : pending?.status === 'approved_and_applied_mock' ? 'Tutto pronto.' : 'Sono pronto ad aiutarti.'}</h2><p>{pending?.status === 'approval_required' ? 'Controlla il conflitto e scegli se confermare la modifica.' : pending?.status === 'approved_and_applied_mock' ? 'La modifica è stata registrata. Puoi avvisare i partecipanti.' : 'Parti da un messaggio ricevuto: il calendario resta sullo sfondo.'}</p></section>
          <section className="context-card"><div className="context-heading"><span>CONTROLLO</span><span className="check-status"><i /> {quality.status === 'pass' ? 'Dati verificati' : 'In attesa'}</span></div><InfoRow label="Eventi nel catalogo" value={state.events?.length || '—'} /><InfoRow label="Fonti ricevute" value={state.source_count || 0} /><InfoRow label="Modifiche aperte" value={pending?.status === 'approval_required' ? 1 : 0} tone={pending?.status === 'approval_required' ? 'accent' : ''} /></section>
          <details className="context-card details-card"><summary>Privacy e traccia</summary><div className="details-content"><p>Le informazioni vengono usate solo per verificare il cambio. Il modello non autorizza azioni e le comunicazioni sono simulate.</p>{pending?.privacy && <div className="privacy-list"><InfoRow label="Elementi rimossi" value={pending.privacy.redactions} /><InfoRow label="Fonte originale" value="Conservata localmente" /></div>}{state.audit?.length > 0 && <div className="audit-list"><span className="overline">ULTIME ATTIVITÀ</span>{state.audit.slice(-3).reverse().map((entry, index) => <div className="audit-item" key={`${entry.action}-${index}`}><i /><span>{entry.action.replaceAll('_', ' ')}</span></div>)}</div>}</div></details>
          <details className="context-card details-card"><summary>Dati della demo</summary><div className="details-content"><label className="dataset-label" htmlFor="dataset">Dataset</label><select id="dataset" value={selectedDataset} onChange={event => loadDataset(event.target.value)}>{datasets.map(name => <option key={name}>{name}</option>)}</select><div className="table-wrap"><table><caption className="sr-only">Prime righe del dataset {selectedDataset}</caption><thead><tr>{datasetRows[0] && Object.keys(datasetRows[0]).slice(0, 3).map(key => <th scope="col" key={key}>{key.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{datasetRows.slice(0, 4).map((row, index) => <tr key={index}>{Object.keys(datasetRows[0] || {}).slice(0, 3).map(key => <td key={key}>{String(row[key] ?? '—')}</td>)}</tr>)}</tbody></table></div></div></details>
        </aside>
      </div>

      {(feedback || error) && <div className={`feedback ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'} aria-live="polite">{error || feedback}</div>}
      <footer><span>H-OS</span> Controllo eventi <i>·</i> Demo sintetica <i>·</i> Decisioni sempre umane</footer>
    </main>
  </div>
}

const rootContainer = document.getElementById('root')
const appRoot = window.__HOS_REACT_ROOT || createRoot(rootContainer)
window.__HOS_REACT_ROOT = appRoot
appRoot.render(<App />)
