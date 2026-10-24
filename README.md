# H-OS

<p align="center">
  <strong>Development Methodology</strong><br />
  A systems approach to turning fragmented organizational information into traceable operational action.
</p>

<p align="center">
  <a href="#the-first-vertical-slice">Vertical slice</a>
  &nbsp;&middot;&nbsp;
  <a href="#validation-strategy">Validation</a>
  &nbsp;&middot;&nbsp;
  <a href="docs/H-OS_Canonical_Project.pdf">Project brief</a>
  &nbsp;&middot;&nbsp;
  <a href="README.it.md">Italiano</a>
</p>

---

## The premise

H-OS treats H-FARM as an interconnected organizational ecosystem rather than a collection of independent departments.

The system connects organizational knowledge, processes and operations across H-FARM. The implementation focuses on one complete, useful and extensible workflow: a campus event system.

> **Canonical scope**
>
> One ecosystem mapped. One vertical slice implemented. One architecture designed for future expansion.

## 01 — System thinking

We began by mapping H-FARM's main operational entities, including H-FARM College, Business School, Startup Center and Campus Operations. We then traced their potential relationships, information flows, responsibilities and data sources.

The core problem is fragmentation: organizational knowledge can become distributed across teams, tools and processes, making coordination and decision-making more difficult.

## 02 — Ontology-driven architecture

H-OS uses a theoretical organizational ontology to represent the ecosystem as a shared operational model.

| Model layer | What it represents |
| --- | --- |
| **Entities** | Organizations, departments, people, events, projects, resources and documents. |
| **Relationships** | Dependencies, ownership, responsibilities and interactions. |
| **Properties and states** | Availability, status, permissions and operational conditions. |
| **Actions** | Updates, approvals, notifications and workflow execution. |

The architecture has three primary components:

```text
Librarian  →  Brain / Ontology  →  Agents
```

Gemma 4 supports the interpretation of unstructured information. Deterministic rules govern permissions and operational actions.

## 03 — From vision to vertical slice

We adopted a vertical-slice approach, similar to a walking skeleton, instead of attempting to build the entire AI Operating System at once.

### H-OS — the system vision

A general architecture for connecting organizational knowledge, processes and operations across H-FARM.

### Event System — the vertical slice

A focused implementation showing how that architecture works on a concrete campus event management workflow.

The vertical slice connects every essential system component without requiring the implementation of the entire organizational ontology.

## The first vertical slice

The initial use case demonstrates how H-OS responds to an operational change.

**Scenario:** a campus event is canceled, affecting room availability and facility operations.

1. The **Librarian** detects and processes the updated event information.
2. **Gemma 4** interprets the unstructured notification.
3. The **Brain** updates the relevant objects and relationships.
4. An **agent** detects the operational consequences.
5. The **Policy Engine** determines which simulated actions are allowed and which require human approval.
6. The system executes authorized mock actions and records the results.

This is the complete operational loop:

```text
Information  →  Knowledge  →  Decision  →  Action  →  Feedback
```

## Validation strategy

We separate three objectives:

| Objective | Question |
| --- | --- |
| **Architectural validation** | Can the ontology represent connected organizational objects and support actions? |
| **Technical validation** | Do the Librarian, Brain, agent, access controls and audit trail function together? |
| **Product validation** | Does the workflow reduce operational friction compared with existing approaches? |

The prototype uses synthetic or public data and simulated actions only.

## What this proves

We mapped the theoretical ontology of the wider H-FARM ecosystem, but we are implementing only one vertical slice.

The objective is not to build the entire operating system during the hackathon. It is to demonstrate that its core architecture can support a complete, useful and extensible operational workflow.

<p align="center">
  <strong>One ecosystem mapped.</strong><br />
  One vertical slice implemented.<br />
  One architecture designed for future expansion.
</p>

---

<sub>This README is the canonical H-OS development methodology. The accompanying PDF is retained as the project brief and source artifact.</sub>
