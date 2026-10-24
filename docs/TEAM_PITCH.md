# H-OS / Event Coordinator

## Il pitch in 30 secondi

H-OS è il sistema integrale per collegare informazioni, decisioni e operazioni dell’organizzazione.

**Event Coordinator** è la sua prima vertical slice: un assistente operativo per chi gestisce gli eventi.

Quando arriva un cambio di orario, la persona incolla il messaggio nella chat. Event Coordinator capisce cosa è cambiato, controlla la sala, spiega il problema, propone una soluzione e prepara la comunicazione ai partecipanti.

La persona approva sempre l’azione finale.

## Il problema

Un semplice cambio di orario obbliga spesso a passare tra email, calendario, fogli e messaggi per:

- capire il nuovo orario;
- verificare la sala;
- trovare un’alternativa;
- aggiornare la prenotazione;
- avvisare i partecipanti;
- ricordare chi ha deciso e perché.

Event Coordinator riunisce questi passaggi in una conversazione guidata. H-OS è il sistema più ampio che potrà estendere lo stesso modello ad altri processi organizzativi.

## Come si usa

### 1. Incolla il messaggio

Esempio:

> “Il workshop AI #204 è stato spostato dalle 15:00 alle 17:30 del 31 ottobre. La durata rimane di 90 minuti.”

### 2. Leggi la risposta di Event Coordinator

Event Coordinator mostra in modo diretto:

- evento, data, ora e durata riconosciuti;
- conflitto trovato nella sala B3-201;
- evento che occupa lo stesso intervallo;
- alternativa disponibile: B3-202;
- motivazione e prossima azione.

### 3. Approva la decisione

Il sistema non modifica automaticamente la prenotazione. Il ruolo **Space Coordinator** può confermare o rifiutare la proposta.

### 4. Avvisa le persone coinvolte

Dopo l’approvazione, Event Coordinator prepara un messaggio per i quattro partecipanti e permette di registrare un invio simulato.

## Il rapporto tra H-OS ed Event Coordinator

H-OS è il sistema integrale. Event Coordinator dimostra un solo percorso concreto al suo interno:

**messaggio → interpretazione → controllo → decisione → comunicazione → audit**

La demo attraversa quindi tutto il ciclo operativo senza pretendere di implementare l’intero H-OS.

Il calendario resta sullo sfondo. In primo piano compare soltanto ciò che richiede attenzione.

## Dove serve l’AI

L’AI interpreta il linguaggio naturale e lo trasforma in dati ordinati.

I controlli su disponibilità, sovrapposizioni, capacità, permessi e audit restano deterministici e verificabili.

L’AI non inventa dati mancanti, non decide da sola e non autorizza operazioni.

## Privacy first

- la demo usa dataset sintetici;
- le chiavi API non sono nel frontend pubblico;
- il testo originale resta nella demo locale;
- prima dell’eventuale inferenza vengono minimizzati i dati non necessari;
- le comunicazioni sono simulate;
- ogni azione mostra ruolo, fonte e motivazione.

## Demo per il team

1. Aprire la [demo pubblica](https://hacktoberfest-26.github.io/loop-closers-hos-event-system/).
2. Lasciare il ruolo **Event Operations Manager**.
3. Premere **Analizza messaggio**.
4. Osservare il conflitto B3-201 e la proposta B3-202.
5. Cambiare ruolo in **Space Coordinator**.
6. Confermare la modifica.
7. Preparare l’anteprima e registrare l’invio demo.

## Cosa dimostra e cosa non dimostra

Dimostra un flusso completo e comprensibile per controllare una modifica evento.

Non è ancora un calendario collegato a sistemi reali, non invia email reali e non dimostra un’integrazione LLM attiva nella versione GitHub Pages. Per il collegamento a dati e modelli reali servono backend sicuro, autenticazione e integrazioni autorizzate.

## Stato attuale

La demo pubblica è una build statica con UI chatbot, dataset sintetici e motore deterministico nel browser. È pensata per rendere visibile il valore del prodotto prima di aggiungere integrazioni operative.
