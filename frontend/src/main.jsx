import React, { useEffect, useMemo, useState } from 'react'
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

function Badge({ children, tone = 'neutral' }) { return <span className={`badge ${tone}`}>{children}</span> }
function Stat({ label, value, detail }) { return <div className="stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }

function App() {
  const [role, setRole] = useState(roles[0])
  const [notice, setNotice] = useState(demoNotice)
  const [health, setHealth] = useState({ mode: 'baseline' })
  const [quality, setQuality] = useState({ status: 'unknown' })
  const [state, setState] = useState({ events: [], pending: null, source_count: 0 })
  const [result, setResult] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState('events')
  const [datasetRows, setDatasetRows] = useState([])
  const [communication, setCommunication] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const modelLabel = health.mode === 'google' ? 'Gemma 4 · Google API' : health.mode === 'backboard' ? 'Gemma 4 · modello online' : health.mode === 'gemma' ? 'Gemma 4 · modello locale' : health.mode === 'simulation' ? 'Gemma 4 · simulazione demo' : 'Controllo automatico'
  const pending = result?.pending || state.pending
  const decision = pending?.status === 'human_review'
    ? { title: 'Il messaggio non è abbastanza chiaro per procedere.', reason: pending.reason || 'Manca un’informazione verificabile.', next: 'Controlla il testo e chiedi una conferma.' }
    : pending?.conflicts?.length
    ? { title: 'La sala attuale non va bene per il nuovo orario.', reason: `È già occupata dall’evento #${pending.conflicts.join(', #')}.`, next: pending.suggested_room ? `Controlla e approva ${pending.suggested_room}.` : 'Serve una verifica manuale.' }
    : pending?.change
      ? { title: 'La sala attuale può restare la stessa.', reason: 'Non abbiamo trovato altre prenotazioni nello stesso intervallo.', next: 'Il coordinatore può confermare la modifica.' }
      : { title: 'Pronto a controllare un cambiamento.', reason: 'Incolla il messaggio ricevuto per iniziare.', next: 'Il sistema confronterà l’orario con le prenotazioni.' }
  const counts = useMemo(() => ({ events: state.events?.length || 0, rooms: datasetRows.length && selectedDataset === 'rooms' ? datasetRows.length : '—' }), [state.events, datasetRows, selectedDataset])

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
  async function analyse() {
    setBusy(true); setMessage(''); setError('')
    try { const data = await request('ingest', role, { method: 'POST', body: JSON.stringify({ notice }) }); setResult(data); setState(data); setMessage('Notice parsed and impact analysis completed.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function decide(approve) {
    setBusy(true); setMessage(''); setError('')
    try { const data = await request('decide', role, { method: 'POST', body: JSON.stringify({ approve }) }); setResult(data); setState(data); setMessage(approve ? 'Mock booking approved.' : 'Change rejected.'); await loadDataset('bookings') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function previewCommunication() {
    setBusy(true); setMessage(''); setError('')
    try { setCommunication(await request('communications/preview', role, { method: 'POST', body: JSON.stringify({ event_id: pending?.change?.event_id }) })); setMessage('Messaggio pronto per la revisione.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function sendCommunication() {
    setBusy(true); setMessage(''); setError('')
    try { setCommunication(await request('communications/send', role, { method: 'POST', body: JSON.stringify({ event_id: pending?.change?.event_id }) })); setMessage('Notifica demo registrata.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function resetDemo() {
    setBusy(true); setMessage(''); setError('')
    try { const data = await request('reset', role, { method: 'POST', body: JSON.stringify({}) }); setRole(roles[0]); setResult(data); setState(data); setCommunication(null); setNotice(demoNotice); setMessage('Demo pronta per una nuova prova.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  useEffect(() => { refresh(); loadDataset('events') }, [role])

  return <div className="shell">
    <a className="skip-link" href="#main-content">Salta al contenuto principale</a>
    <header className="topbar"><div className="brand"><span className="brandmark"><img src={asset('hos-mark.svg')} alt="" aria-hidden="true" /></span><span>H-OS</span><span className="slash">/</span><span className="subbrand">Controllo eventi</span></div><div className="topmeta"><Badge tone="green">Dati di esempio</Badge><span className="dot" /><span>Ambiente demo</span><button className="reset-demo" type="button" onClick={resetDemo} disabled={busy} aria-label="Ripristina la demo">Nuova demo</button></div></header>
    <main id="main-content">
      <section className="hero"><div><p className="eyebrow">LOOP CLOSERS · H-FARM HACKTOBERFEST · VERTICAL SLICE H-OS</p><h1>Un cambio di orario. Una risposta chiara.</h1><p className="lede">Non devi aprire il calendario. Inoltra o incolla la comunicazione: H-OS mostra solo ciò che richiede una decisione.</p></div><div className="hero-side"><Badge tone={health.mode === 'baseline' ? 'neutral' : 'blue'}>{modelLabel}</Badge><Badge tone={quality.status === 'pass' ? 'green' : 'red'}>Dati controllati · {quality.status === 'pass' ? 'sì' : 'no'}</Badge><small>Nessuna prenotazione reale viene modificata</small></div></section>
      <section className="frictionless-banner" aria-label="Principio frictionless"><div><p className="eyebrow">FRICTIONLESS BY DEFAULT</p><h2>Il calendario resta sullo sfondo.</h2><p>In primo piano arrivano solo eccezioni, conflitti e prossima azione.</p></div><div className="frictionless-steps"><span><b>01</b>Ricevi</span><span><b>02</b>Verifica</span><span><b>03</b>Decidi</span></div></section>
      <section className="how-it-works"><div><span className="how-number">1</span><strong>Racconta il cambiamento</strong><small>Librarian + LLM · interpreta il testo</small></div><span className="how-arrow">→</span><div><span className="how-number">2</span><strong>Controlliamo la sala</strong><small>Brain + Agent · verifica gli impatti</small></div><span className="how-arrow">→</span><div><span className="how-number">3</span><strong>Una persona decide</strong><small>Policy + Action · approva e registra</small></div></section>
      <section className={`decision-card ${pending?.conflicts?.length ? 'has-conflict' : ''}`}><div className="decision-mark">{pending?.conflicts?.length ? '!' : '✓'}</div><div className="decision-copy"><small>RISULTATO PER CHI AMMINISTRA</small><h2>{decision.title}</h2><p><strong>Perché:</strong> {decision.reason}</p></div><div className="decision-next"><small>COSA FARE ADESSO</small><strong>{decision.next}</strong></div></section>
      <section className="principles-grid"><article className="principle-card"><div className="principle-icon">AI</div><div><small>DOVE AIUTA L’LLM</small><h2>Da un messaggio scritto a una richiesta ordinata.</h2><p>Il modello interpreta email e messaggi. Il sistema verifica poi orari, sale e regole in modo deterministico.</p></div></article><article className="principle-card privacy-card"><div className="principle-icon lock">P</div><div><small>PRIVACY FIRST</small><h2>Al modello arriva solo il minimo necessario.</h2><p>Il testo originale resta nel sistema. Email e numeri di telefono vengono rimossi prima dell’eventuale chiamata.</p>{pending?.privacy && <div className="privacy-facts"><span>{pending.privacy.redactions} elementi rimossi</span><span>Fonte originale conservata localmente</span></div>}</div></article></section>
      <section className="stats"><Stat label="Eventi nel catalogo" value={counts.events} detail="dati di esempio" /><Stat label="Sale" value="4" detail="con disponibilità" /><Stat label="Modifica aperta" value={pending?.status === 'approval_required' ? '1' : '0'} detail="attende una decisione" /><Stat label="Fonti ricevute" value={state.source_count || 0} detail="con testo originale" /></section>
      <nav className="tabs" aria-label="Sezioni del sistema"><a className="active" href="#workflow" aria-current="page">Controllo evento</a><a href="#catalogo">Catalogo dati</a><a href="#registro">Registro attività</a><div className="role-control"><label htmlFor="role-select">Sto usando il sistema come</label><select id="role-select" value={role} onChange={e => setRole(e.target.value)}>{roles.map(r => <option key={r}>{r}</option>)}</select></div></nav>
      <section className="workspace" id="workflow" aria-label="Flusso di controllo dell'evento">
        <div className="column">
          <article className="card source-card"><div className="card-head"><div><span className="step">01</span><h2>Invia il cambiamento</h2></div><Badge>Un solo messaggio</Badge></div><p className="muted">Non cercare l’evento nel calendario. Incolla l’email o la nota ricevuta: l’LLM estrae evento, giorno, ora e durata senza compilazione manuale.</p><textarea aria-label="Messaggio con il cambiamento dell'evento" value={notice} onChange={e => setNotice(e.target.value)} /><div className="card-foot"><span className="muted">Il testo originale resta nella demo</span><button className="primary" onClick={analyse} disabled={busy || role !== roles[0]}>{busy ? 'Controllo in corso…' : 'Mostra cosa fare'} <span>↗</span></button></div></article>
          <article className="card"><div className="card-head"><div><span className="step">02</span><h2>Che cosa abbiamo capito</h2></div><Badge tone={pending?.change?.method === 'backboard' ? 'blue' : 'neutral'}>{pending?.change ? 'Verificato' : 'In attesa'}</Badge></div>{pending?.change ? <div className="json-grid"><div><small>Evento</small><strong>#{pending.change.event_id}</strong></div><div><small>Giorno</small><strong>{pending.change.date}</strong></div><div><small>Nuova ora</small><strong>{pending.change.start}</strong></div><div><small>Durata</small><strong>{pending.change.duration_min} minuti</strong></div></div> : <Empty text="Dopo il controllo vedrai qui i dati estratti dal messaggio." />}{pending?.change?.evidence && <blockquote>Testo usato: “{pending.change.evidence}”</blockquote>}</article>
        </div>
        <div className="column">
          <article className="card impact-card"><div className="card-head"><div><span className="step">03</span><h2>La sala è libera?</h2></div><Badge tone={pending?.conflicts?.length ? 'red' : 'green'}>{pending ? (pending.conflicts?.length ? 'C’è un problema' : 'Tutto libero') : 'In attesa'}</Badge></div>{pending ? <>{pending.conflicts?.length ? <div className="alert red"><strong>La sala è già occupata</strong><span>L’evento #{pending.conflicts.join(', #')} usa la stessa sala nel nuovo orario.</span></div> : <div className="alert green"><strong>Nessuna sovrapposizione</strong><span>L’evento può restare nella sala attuale.</span></div>}<div className="recommendation"><small>Alternativa proposta</small><strong>{pending.suggested_room || pending.current_room || 'Nessuna sala libera'}</strong><span>{pending.suggested_room ? 'Libera per tutta la durata dell’evento' : 'Serve una verifica manuale'}</span></div></> : <Empty text="Confronteremo il nuovo orario con tutte le prenotazioni." />}</article>
          <article className="card"><div className="card-head"><div><span className="step">04</span><h2>Una persona conferma</h2></div><Badge>Controllo umano</Badge></div>{pending?.status === 'approval_required' ? <><p className="muted">Il sistema propone una modifica, ma non la applica da solo. Solo il coordinatore degli spazi può confermare.</p><div className="actions"><button className="primary" disabled={busy || role !== 'Space Coordinator'} onClick={() => decide(true)}>Conferma modifica</button><button disabled={busy || role !== 'Space Coordinator'} onClick={() => decide(false)}>Rifiuta</button></div>{role !== 'Space Coordinator' && <small className="warning">Per decidere, scegli “Space Coordinator” nel menu sopra.</small>}</> : <Empty text="Dopo l’analisi, qui comparirà la decisione da prendere." />}</article>
        </div>
      </section>
      {pending?.status === 'approved_and_applied_mock' && <section className="card communication-card"><div className="card-head"><div><span className="step">05</span><h2>Avvisa le persone coinvolte</h2></div><Badge tone={communication?.status === 'mock_sent' ? 'green' : 'blue'}>{communication?.status === 'mock_sent' ? 'Notifica registrata' : 'Pronto'}</Badge></div><p className="muted">La sala è stata aggiornata nei dati demo. Ora puoi preparare un messaggio per i partecipanti, controllarlo e registrare un invio simulato.</p><div className="communication-actions"><button className="primary" onClick={previewCommunication} disabled={busy}>Prepara messaggio</button><button onClick={sendCommunication} disabled={busy || role !== 'Space Coordinator' || !communication}>Registra invio demo</button></div>{role !== 'Space Coordinator' && <small className="warning">Per registrare l’invio devi essere Space Coordinator.</small>}{communication && <div className="message-preview"><div><small>DESTINATARI</small><strong>{communication.recipient_count} partecipanti</strong></div><div><small>OGGETTO</small><strong>{communication.message.subject}</strong></div><p>{communication.message.body}</p></div>}</section>}
      <section className="lower-grid"><article className="card" id="catalogo"><div className="card-head"><div><span className="step">06</span><h2>Dati di supporto</h2></div><Badge>{datasetRows.length} righe</Badge></div><p className="muted">Non servono per il percorso principale. Sono disponibili quando vuoi verificare eventi, sale, edifici, messaggi e regole della demo.</p><div className="dataset-tabs" role="group" aria-label="Seleziona dataset">{datasets.map(name => <button type="button" className={selectedDataset === name ? 'selected' : ''} aria-pressed={selectedDataset === name} key={name} onClick={() => loadDataset(name)}>{name.replace('_', ' ')}</button>)}</div><div className="table-wrap"><table><caption className="sr-only">Prime righe del dataset {selectedDataset}</caption><thead><tr>{datasetRows[0] && Object.keys(datasetRows[0]).slice(0, 5).map(key => <th scope="col" key={key}>{key.replace('_', ' ')}</th>)}</tr></thead><tbody>{datasetRows.slice(0, 6).map((row, i) => <tr key={i}>{Object.keys(datasetRows[0] || {}).slice(0, 5).map(key => <td key={key}>{String(row[key] ?? '—')}</td>)}</tr>)}</tbody></table></div></article><article className="card provenance" id="registro"><div className="card-head"><div><h2>Che cosa è successo</h2><p className="muted">Il registro conserva la fonte, la decisione e la comunicazione.</p></div><Badge tone="green">Tracciabile</Badge></div>{state.audit?.length ? state.audit.slice(-4).reverse().map((entry, i) => <div className="audit-row" key={i}><span className="audit-dot" /><div><strong>{entry.action}</strong><small>{entry.actor} · {entry.source || entry.source_id || 'sistema'}</small></div></div>) : <Empty text="Scegli Administrator per vedere il registro completo." />}</article></section>
      {(message || error) && <div className={`toast ${error ? 'toast-error' : ''}`} role={error ? 'alert' : 'status'} aria-live="polite">{error || message}</div>}
      <footer>H-OS Controllo eventi <span>·</span> dati di esempio <span>·</span> ogni modifica richiede una persona</footer>
    </main>
  </div>
}
function Empty({ text }) { return <div className="empty">{text}</div> }
const rootContainer = document.getElementById('root')
const appRoot = window.__HOS_REACT_ROOT || createRoot(rootContainer)
window.__HOS_REACT_ROOT = appRoot
appRoot.render(<App />)
