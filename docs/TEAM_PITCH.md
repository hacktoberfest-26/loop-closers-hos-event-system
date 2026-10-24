# H-OS Event System

## Il pitch in 30 secondi

Quando cambia un evento, il responsabile non deve più cercare informazioni in email, calendari e fogli diversi.

H-OS legge la richiesta, controlla la sala, evidenzia i conflitti, propone una soluzione e prepara le comunicazioni. La persona mantiene sempre l’ultima parola.

## Il problema

Un cambio di orario può richiedere di:

- capire cosa è cambiato;
- verificare se la sala è libera;
- trovare un’alternativa;
- aggiornare la prenotazione;
- avvisare i partecipanti;
- lasciare una traccia della decisione.

Oggi queste attività sono spesso separate e manuali.

## Come funziona

1. **Arriva una richiesta** in linguaggio naturale.
2. **L’AI la interpreta** e la converte in dati verificabili: evento, data, orario e durata.
3. **Il motore controlla i dati** delle prenotazioni e rileva eventuali sovrapposizioni.
4. **Il sistema propone un’alternativa** compatibile con i vincoli della sala.
5. **L’operatore approva o rifiuta** la modifica.
6. **H-OS prepara le comunicazioni** e registra l’audit dell’operazione.

## Esempio

> “Il workshop AI #204 è spostato dalle 15:00 alle 17:30 del 31 ottobre. Dura 90 minuti.”

H-OS risponde:

- la sala B3-201 è occupata dalle 17:00 alle 19:00;
- la sala B3-202 è disponibile;
- la modifica richiede approvazione;
- quattro partecipanti devono essere informati.

## Dove serve l’AI

L’AI riduce il lavoro di lettura e interpretazione. Non decide autonomamente la disponibilità, non inventa informazioni mancanti e non autorizza operazioni.

I controlli su orari, conflitti, permessi e audit sono deterministici e verificabili.

## Privacy first

- i dati della demo sono sintetici;
- la chiave API non viene inserita nel frontend pubblico;
- le comunicazioni sono solo simulate;
- ogni modifica mostra chi deve approvarla e perché;
- l’audit rende visibile la storia dell’operazione.

## Cosa dimostra questa vertical slice

H-OS collega un’informazione non strutturata a una decisione operativa:

**richiesta → dati → controllo → decisione → comunicazione → audit**

Non è un calendario sostitutivo. È uno strumento di controllo che aiuta chi amministra a capire rapidamente cosa fare e perché.

## Stato attuale

La demo pubblica usa un dataset sintetico e un motore deterministico nel browser. Mostra il flusso completo senza esporre credenziali o dati reali.

Demo: <https://hacktoberfest-26.github.io/loop-closers-hos-event-system/>

Il collegamento a un modello LLM reale e ai sistemi operativi degli eventi richiede un backend sicuro e integrazioni autorizzate.
