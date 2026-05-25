---
project: "10xCards"
context_type: greenfield
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 3
  hard_deadline: "2026-08-01"
  after_hours_only: true
created: 2026-05-20
updated: 2026-05-20
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: "pain category"
      decision: "workflow friction — card creation is tedious and breaks study flow"
    - topic: "primary persona scope"
      decision: "specific role — person preparing for a trip abroad, learning useful phrases"
    - topic: "insight"
      decision: "existing tools (Anki plugins, Quizlet AI) still require manual effort; frictionless paste-and-go card gen is missing"
  frs_drafted: 12
  quality_check_status: accepted
---

## Vision & Problem Statement

Creating good flashcards from study text is tedious — it breaks the study flow and discourages learners from adopting spaced repetition, despite SRS being one of the most effective learning methods available. A person preparing for a trip abroad sits down with a list of useful phrases, opens their notes app, and faces the grind of manually splitting each phrase into a question/answer card. The friction is enough that most people skip it entirely.

The insight: existing tools (Anki plugins, Quizlet AI) still require significant manual setup or produce output that needs heavy editing. A truly frictionless "paste text → get ready-to-study cards" experience does not exist in any mainstream, accessible form.

## User & Persona

**Primary persona:** A traveller preparing for a trip abroad — learning practical phrases specific to their destination and planned activities (e.g. ordering food, navigating transport, asking for directions). They are motivated and have their source material ready (a phrase list, a travel blog excerpt, a course snippet), but they are not technical and don't want to configure flashcard software. They want to study, not set up tools.

## Access Control

Email + password authentication. Flat user model — every registered user has identical capabilities and can only see and manage their own decks and study sessions. Open registration (anyone can create an account). Unauthenticated users are redirected to login/register before accessing any deck or study content. No admin roles in v1.

## Success Criteria

### Primary
- 75% of AI-generated flashcard candidates are accepted by the user without editing (measures card quality).

### Secondary
- A user returns for a second study session within 7 days of their first session (measures retention / re-engagement).

### Guardrails
- Cards and study progress are never lost between sessions — data durability is a hard requirement. Any session that results in lost cards is a regression.

---

**MVP flow (scoped v1):**
1. User registers / logs in with email + password
2. User pastes text (phrases, paragraph, list)
3. AI generates flashcard candidates (front/back pairs)
4. User reviews, accepts, edits, or discards each generated card
5. Cards saved to their deck
6. User starts a study session — cards shown in a simple sequential queue (no SRS scheduling)
7. User marks each card: knew it / didn't

**Scope-down decision:** SRS algorithm dropped from v1. Simple "show all cards once per session" queue. SRS added in v2 once the card-gen loop is validated.

**Timeline:** 3 weeks after-hours work (scoped down from original 8-step flow with 2 integrations).

## Functional Requirements

### Authentication
- FR-001: User can register with email and password. Priority: must-have
- FR-002: User can log in and log out. Priority: must-have
  > Socrates: Counter-argument considered: "For a solo MVP, local storage removes auth complexity." Resolution: overridden — basic email + password auth included in v1 for data ownership and persistence across devices.

### Card Generation
- FR-003: User can paste text and an optional topic hint, then trigger AI flashcard generation. Priority: must-have
  > Socrates: Counter-argument considered: "Unstructured text produces high-variance AI cards; users lose trust before seeing value." Resolution: added optional topic hint field to give AI context and improve card quality.
- FR-004: User can review all AI-generated card candidates in a bulk editable table. Priority: must-have
- FR-005: User can accept, edit, or discard each AI-generated card from the bulk review table. Priority: must-have
  > Socrates: Counter-argument considered: "One-by-one review with 20 cards causes abandonment mid-flow." Resolution: changed to bulk table review — all candidates shown at once, editable inline.

### Card Management
- FR-006: User can manually create a flashcard (front + back). Priority: nice-to-have
  > Socrates: Counter-argument considered: "Manual creation adds no differentiation — editing a generated card (FR-008) already covers the fallback." Resolution: demoted to nice-to-have; editing covers the need in v1.
- FR-007: User can view all their saved flashcards. Priority: must-have
  > Socrates: No counter-argument; stands as written.
- FR-008: User can edit a saved flashcard. Priority: must-have
  > Socrates: No counter-argument; stands as written.
- FR-009: User can delete a flashcard with a confirmation step (no silent data loss). Priority: must-have
  > Socrates: Counter-argument considered: "Delete without undo is a data-loss path — especially dangerous with local-only storage." Resolution: confirmation required before delete. No undo in v1 but no silent deletion.

### Study Session
- FR-010: User can start a study session showing up to 20 randomly shuffled cards from their deck. Priority: must-have
- FR-011: User can mark each card as "knew it" or "didn't know" during a session. Priority: must-have
  > Socrates: Counter-argument considered: "'Show all cards' becomes a chore at 50+ cards — users disengage." Resolution: session capped at 20 cards, randomly shuffled per session. SRS scheduling added in v2.

### Persistence
- FR-012: User's cards and study progress are durably persisted — not reliant on volatile browser storage. Priority: must-have
  > Socrates: Counter-argument considered: "localStorage is cleared by browsers; a traveller who built their deck over days faces silent data loss." Resolution: durable persistence required (mechanism — local JSON, server DB — is a downstream stack decision; see Forward: tech-stack).

## User Stories

### US-01: Traveller generates a deck from pasted phrases

- **Given** a logged-in user who pastes a list of travel phrases into the text input
- **When** they trigger AI card generation and review the generated candidates
- **Then** they can accept or edit each card and end up with a saved deck ready to study

#### Acceptance Criteria
- At least one card is generated per distinct phrase/term in the pasted text
- The user can dismiss (discard) any card they don't want without affecting others
- After review, the saved deck is accessible in a subsequent session

## Business Logic

Given a destination and activity context, 10xCards selects the most travel-relevant vocabulary and phrases from the user's text, generates accurate translations, and delivers them as study-ready flashcard candidates — so the traveller never needs to manually decide what to learn or how to phrase each card.

The rule consumes two user-facing inputs: (1) a context field (destination + activity, e.g. "Italy, restaurant ordering") and (2) source text (a phrase list, a travel article excerpt, or a raw block of text). Its output is a ranked set of front/back card candidates where the front is the phrase in the user's language and the back is the translation with travel-context accuracy. The user encounters the rule's output in the bulk review table, where they can accept, edit, or discard each candidate before saving the deck.

The rule does not name a specific AI model or translation API — those are downstream implementation choices. The domain decision is the selection and translation of travel-relevant content; the mechanism that performs it is opaque to the PRD.

## Non-Functional Requirements

- A failed AI card-generation call always produces a visible, specific error message — a silent empty result is never acceptable. The user must know whether the failure was due to a network issue, an invalid input, or a service outage.
- AI card generation completes within 10 seconds for a typical paste of up to 500 words. Operations that exceed 10 seconds display continuous visible progress feedback so the user knows the system is working.

## Forward: tech-stack

- Data persistence: user wants cards + progress stored in JSON files on disk (not volatile browser storage). This may imply a local desktop app, a server-backed web app, or a File System Access API approach. Stack selector resolves this.
- Email + password auth is in v1 (basic). Stack selector resolves session management, token strategy, and password hashing mechanism.

## Non-Goals

- **No custom SRS algorithm** — v1 uses a simple capped queue (20 randomly shuffled cards per session). A ready-made SRS algorithm (or a more sophisticated scheduling system) is a v2 concern. Building our own SuperMemo/Anki-style algorithm in v1 is out of scope.
- **No mobile apps** — web only for v1. Mobile is a future platform; it does not constrain v1 architecture.
- **No sharing or collaborative decks** — each deck is private to the user who created it. No public deck library, no deck sharing between accounts, no team workspaces in v1.
- **No file import (PDF, DOCX, images, etc.)** — source input is paste-only in v1. File parsing adds surface area before the core AI generation loop is validated.
- **No integrations with external learning platforms** — no Anki export, no Duolingo sync, no LMS integrations in v1.

*Scale note (forward):* At larger scale, shared community phrase sets could reduce per-user AI calls — worth revisiting in v2 product planning.

## Quality cross-check

Run: 2026-05-20. Result: **accepted** — all elements present.

| Element | Status |
|---|---|
| Access Control | ✅ present — email + password, flat user model |
| Business Logic | ✅ present — one-sentence travel-context selection + translation rule |
| Project artifacts | ✅ present — shape-notes.md with valid checkpoint |
| Timeline-cost ack | ✅ present — 3 weeks after-hours, scoped down, hard deadline 2026-08-01 |
| Non-Goals | ✅ present — 5 explicit non-goals |
| Preserved behavior | n/a (greenfield) |
