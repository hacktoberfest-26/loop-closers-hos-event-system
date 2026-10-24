# H-OS / Event Coordinator

## Il pitch

H-OS è il sistema integrale che collega informazioni, decisioni e operazioni di un’organizzazione.

**Event Coordinator** è la sua vertical slice: uno strumento per chi amministra eventi e deve gestire un cambiamento senza inseguire email, calendario, fogli e messaggi separati.

Quando arriva una comunicazione in linguaggio naturale, la persona la incolla nella chat. Event Coordinator identifica il cambiamento, controlla la disponibilità della sala, rende visibili i conflitti, propone il prossimo passo e prepara la comunicazione ai partecipanti.

La persona mantiene sempre il controllo dell’azione finale.

## Il problema concreto

Un cambio di orario apparentemente semplice apre una catena di attività:

1. capire cosa è cambiato;
2. verificare se la sala è ancora libera;
3. trovare un’alternativa compatibile;
4. decidere se approvare la modifica;
5. avvisare le persone coinvolte;
6. conservare fonte, motivazione e risultato.

Il costo non è solo il tempo. È il rischio di aggiornare una parte del sistema e dimenticarne un’altra.

## La user journey

| Momento | Cosa fa la persona | Cosa fa Event Coordinator | Risultato visibile |
| --- | --- | --- | --- |
| 1. Ricezione | Incolla un’email o un messaggio | Mantiene il testo come fonte della richiesta | Nessuna compilazione manuale |
| 2. Comprensione | Controlla evento, data, ora e durata | Interpreta il testo e produce dati strutturati | Il cambiamento diventa leggibile |
| 3. Controllo | Guarda il motivo dell’alert | Confronta l’intervallo con eventi, sale, capacità e vincoli | Conflitto o disponibilità spiegati |
| 4. Scelta | Valuta la proposta | Suggerisce una sala alternativa oppure segnala che serve pianificazione | Un prossimo passo chiaro |
| 5. Approvazione | Conferma o rifiuta come Space Coordinator | Applica solo una modifica mock autorizzata | La decisione resta umana |
| 6. Comunicazione | Prepara l’avviso ai partecipanti | Genera un’anteprima usando i dati aggiornati | Messaggio coerente con la prenotazione |
| 7. Traccia | Consulta l’attività | Registra fonte, ruolo, azione e risultato | Audit comprensibile |

Il ciclo operativo è:

**messaggio → interpretazione → controllo → decisione → aggiornamento → comunicazione → audit**

## La demo principale

Il caso più immediato è **AI Workshop #204**:

> Il workshop AI #204 è stato spostato dalle 15:00 alle 17:30 del 31 ottobre. La durata rimane di 90 minuti.

Event Coordinator mostra che:

- la sala B3-201 è occupata dall’evento #205 tra le 17:00 e le 19:00;
- B3-202 è disponibile e compatibile;
- la modifica richiede l’approvazione di Space Coordinator;
- dopo l’approvazione è possibile preparare l’avviso per i partecipanti.

## Quattro scenari sintetici

La demo rende selezionabili quattro stati operativi, così il team può provare l’intero perimetro della vertical slice:

1. **Conflitto con alternativa** — la sala è occupata e viene proposta B3-202.
2. **Nessun conflitto** — il nuovo intervallo è libero e la sala può restare la stessa.
3. **Richiesta incompleta** — manca un orario verificabile e il caso passa a revisione umana.
4. **Conflitto senza alternativa** — nessuna sala rispetta i vincoli e serve pianificazione manuale.

Ogni scenario parte da un dataset sintetico e può essere ripetuto senza modificare dati reali.

## Cosa rende utile l’AI

L’AI riduce la frizione nel punto in cui una persona dovrebbe leggere testo ambiguo e ricostruire manualmente evento, orario e durata.

Il controllo di sovrapposizioni, capacità, disponibilità, ruoli e audit resta deterministico. L’AI non inventa dati mancanti, non autorizza azioni e non decide al posto della persona.

## Privacy first

- la demo usa dati sintetici;
- il testo originale resta nella sessione locale;
- prima di un’eventuale inferenza vengono minimizzati i dati di contatto non necessari;
- nessuna email reale viene inviata;
- le modifiche e le comunicazioni sono mock;
- ruoli, fonti e motivazioni restano visibili.

## Relazione con H-OS

H-OS è l’architettura più ampia: un modello operativo condiviso per collegare oggetti, responsabilità, regole e azioni dell’organizzazione.

Event Coordinator dimostra quel modello su un solo problema concreto: il controllo di un cambio evento e dei conflitti di sala. La vertical slice è abbastanza piccola da essere verificabile e abbastanza completa da attraversare acquisizione, conoscenza, policy, azione e feedback.

## Demo per il team

1. Aprire la [demo pubblica](https://hacktoberfest-26.github.io/loop-closers-hos-event-system/).
2. Scegliere uno dei quattro scenari nel pannello **Scenario sintetico**.
3. Premere **Avvia simulazione**.
4. Leggere il controllo e la prossima azione suggerita.
5. Se il caso è approvabile, selezionare **Space Coordinator**.
6. Confermare o rifiutare la modifica mock.
7. Preparare l’anteprima della comunicazione.

## Cosa dimostra e cosa non dimostra

Dimostra un flusso operativo completo, leggibile e ripetibile per coordinare una modifica evento.

La build pubblica non è ancora un calendario collegato a sistemi reali, non invia email reali e non dimostra un’inferenza LLM attiva dentro GitHub Pages. Questi passaggi richiedono un backend sicuro, autenticazione, integrazioni autorizzate e osservabilità di produzione.

Il valore dimostrato oggi è il metodo: trasformare una comunicazione non strutturata in una decisione operativa spiegata, verificabile e sempre supervisionata.
