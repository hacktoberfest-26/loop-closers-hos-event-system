# H-OS

<p align="center">
  <strong>Metodologia di sviluppo</strong><br />
  Un approccio sistemico per trasformare informazioni organizzative frammentate in azioni operative tracciabili.
</p>

<p align="center">
  <a href="#la-premessa">Premessa</a>
  &nbsp;&middot;&nbsp;
  <a href="#il-primo-vertical-slice">Vertical slice</a>
  &nbsp;&middot;&nbsp;
  <a href="#strategia-di-validazione">Validazione</a>
  &nbsp;&middot;&nbsp;
  <a href="README.md">English</a>
</p>

---

## La premessa

H-OS considera H-FARM come un ecosistema organizzativo interconnesso, non come una collezione di dipartimenti indipendenti.

Il sistema collega conoscenza organizzativa, processi e operazioni all'interno di H-FARM. L'implementazione si concentra su un unico workflow completo, utile ed estensibile: un sistema per la gestione degli eventi nel campus.

> **Ambito canonico**
>
> Un ecosistema mappato. Un vertical slice implementato. Un'architettura progettata per espansioni future.

## 01 — System thinking

Abbiamo iniziato mappando le principali entità operative di H-FARM, tra cui H-FARM College, Business School, Startup Center e Campus Operations. Abbiamo poi tracciato le loro possibili relazioni, i flussi informativi, le responsabilità e le fonti dati.

Il problema centrale è la frammentazione: la conoscenza organizzativa può distribuirsi tra team, strumenti e processi, rendendo più difficile il coordinamento e il processo decisionale.

## 02 — Architettura guidata dall'ontologia

H-OS utilizza un'ontologia organizzativa teorica per rappresentare l'ecosistema come un modello operativo condiviso.

| Livello del modello | Cosa rappresenta |
| --- | --- |
| **Entità** | Organizzazioni, dipartimenti, persone, eventi, progetti, risorse e documenti. |
| **Relazioni** | Dipendenze, ownership, responsabilità e interazioni. |
| **Proprietà e stati** | Disponibilità, stato, permessi e condizioni operative. |
| **Azioni** | Aggiornamenti, approvazioni, notifiche ed esecuzione di workflow. |

L'architettura ha tre componenti principali:

```text
Librarian  →  Brain / Ontology  →  Agents
```

Gemma 4 supporta l'interpretazione delle informazioni non strutturate. Regole deterministiche governano permessi e azioni operative.

## 03 — Dalla visione al vertical slice

Abbiamo adottato un approccio a vertical slice, simile a uno walking skeleton, invece di tentare di costruire subito l'intero AI Operating System.

### H-OS — la visione del sistema

Un'architettura generale per collegare conoscenza organizzativa, processi e operazioni all'interno di H-FARM.

### Event System — il vertical slice

Un'implementazione focalizzata che mostra come l'architettura opera su un workflow concreto di gestione degli eventi del campus.

Il vertical slice collega tutti i componenti essenziali del sistema senza richiedere l'implementazione dell'intera ontologia organizzativa.

## Il primo vertical slice

Il caso d'uso iniziale mostra come H-OS risponde a un cambiamento operativo.

**Scenario:** un evento del campus viene cancellato, modificando la disponibilità di una sala e le operazioni delle strutture.

1. Il **Librarian** rileva ed elabora l'aggiornamento dell'evento.
2. **Gemma 4** interpreta la notifica non strutturata.
3. Il **Brain** aggiorna gli oggetti e le relazioni interessate.
4. Un **agent** rileva le conseguenze operative.
5. Il **Policy Engine** determina quali azioni simulate sono consentite e quali richiedono approvazione umana.
6. Il sistema esegue le mock action autorizzate e ne registra i risultati.

Questo è il loop operativo completo:

```text
Informazione  →  Conoscenza  →  Decisione  →  Azione  →  Feedback
```

## Strategia di validazione

Distinguiamo tre obiettivi:

| Obiettivo | Domanda |
| --- | --- |
| **Validazione architetturale** | L'ontologia può rappresentare oggetti organizzativi connessi e supportare azioni? |
| **Validazione tecnica** | Librarian, Brain, agent, controlli di accesso e audit trail funzionano insieme? |
| **Validazione di prodotto** | Il workflow riduce l'attrito operativo rispetto agli approcci esistenti? |

Il prototipo utilizza esclusivamente dati sintetici o pubblici e azioni simulate.

## Cosa dimostra

Abbiamo mappato l'ontologia teorica dell'ecosistema H-FARM nel suo complesso, ma implementiamo un solo vertical slice.

L'obiettivo non è costruire l'intero operating system durante l'hackathon. È dimostrare che la sua architettura di base può supportare un workflow operativo completo, utile ed estensibile.

<p align="center">
  <strong>Un ecosistema mappato.</strong><br />
  Un vertical slice implementato.<br />
  Un'architettura progettata per espansioni future.
</p>

---

<sub>Questo README è la versione italiana canonica della metodologia di sviluppo H-OS. Il PDF allegato resta il project brief e l'artefatto sorgente.</sub>
