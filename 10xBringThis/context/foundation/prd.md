---
project: "10xBringThis"
version: 1
status: draft
created: 2026-06-03
context_type: greenfield
product_type: web-app
target_scale:
  users: medium
  qps: "# TODO: qps — see Open Questions"
  data_volume: "# TODO: data_volume — see Open Questions"
timeline_budget:
  mvp_weeks: 3
  hard_deadline: "2026-08-01"
  after_hours_only: true
---

## Vision & Problem Statement

Organizing shared bring-your-own events (parties, BBQs, trips, meetups) is chaotic. When a host asks "who's bringing what?" in a group chat, answers get buried, duplicated, or forgotten — three failure modes compound: coordination overhead from back-and-forth messages, workflow friction from the steps required to update any shared tool, and claim status trapped in unstructured chat history.

The insight: for casual social coordination, people will only adopt a tool that's as fast as sending a message. Existing workarounds fail because they require a designated updater (Google Sheets) or produce unstructured noise (group chat). The app wins by enabling anyone to self-serve a claim in under 30 seconds via a shared link — no login required for participants, real-time visibility of what's taken vs. available, no single-updater bottleneck, no accidental deletion risk.

## User & Persona

**Primary persona:** The event host — a person organizing a shared social event (party, BBQ, trip, meetup) for a group of friends or acquaintances. They need to define what everyone should bring, share the list instantly, and see at a glance who has claimed what.

**Secondary persona:** The event participant — a friend or acquaintance who receives a link, picks up an item, and may want to adjust their claim or leave a comment (e.g., "I'll bring 2 Colas instead of 1"). They join via link with a nickname only — no account required.

Both recurring friend groups (same people, multiple events) and one-off groups (strangers coordinating a single event) are in scope.

## Success Criteria

### Primary
- A host can create an event, add items, and share the link, and a participant can open it, enter a nickname, and claim an item — all within 60 seconds total. This flow completing reliably = the product works.

### Secondary
- Item comments are visible to all participants without a page refresh (live updates on comments, not just on claim state).

### Guardrails
- No two participants can claim the same item simultaneously. Double-claim is a data corruption that defeats the product's core purpose.
- A participant's claim is never silently lost due to page refresh, disconnect, or reconnect. Claim state is durable.

## User Stories

### US-01: Host creates an event and shares it

- **Given** a logged-in host
- **When** they create an event (name, date, optional description), add items to the list, and copy the generated link
- **Then** the event is live and accessible to anyone with the link, items are listed and available to claim

#### Acceptance Criteria
- Event creation completes and the link is available in under 30 seconds of user interaction
- The link works without any login for the recipient
- Items show as unclaimed until a participant claims them

---

### US-02: Participant claims an item at an event

- **Given** a participant has opened the event link and entered their nickname
- **When** they tap/click "Claim" on an available item
- **Then** the item is marked as claimed with their nickname, visible to all connected participants in real time, and the item can no longer be claimed by anyone else

#### Acceptance Criteria
- Claim is visible to all connected participants within ~1 second
- Two participants cannot both claim the same item (last write wins is not acceptable — first claim wins)
- Participant can unclaim their own item; they cannot unclaim someone else's

## Functional Requirements

### Authentication

- FR-001: Host can register with email and password. Priority: must-have
  > Socrates: Counter-argument considered: "magic-link / passwordless is simpler for occasional hosts." Resolution: kept email + password — simpler to implement for MVP. Passwordless can be added in v2.

- FR-002: Host can log in and log out. Priority: must-have

### Event Management

- FR-003: Host can create an event (name, date, optional description). Priority: must-have
  > Socrates: Counter-argument considered: "event edit is rarely needed after the link is shared." Resolution: FR-004 (edit event) demoted to nice-to-have. Host can edit item list freely; the event name/date/description edit is a convenience, not a blocker.

- FR-004: Host can edit their event (name, date, description). Priority: nice-to-have

- FR-004b: Host can delete their event. Priority: must-have

- FR-005: Host can generate a shareable link for the event. Priority: must-have
  > Socrates: Counter-argument considered: link expiry. Resolution: link expires 3–6 months after event date. Added as a business rule. Must-have.

### Item List

- FR-006: Host can add items to the event's bring-list (name, optional quantity). Priority: must-have
  > Socrates: Counter-argument considered: "quantity adds complexity." Resolution: quantity stays as optional field — already optional, minimal implementation cost. Must-have.

- FR-007: Host can edit and delete items on the list. Priority: must-have

- FR-008: Participant can view the item list via the shared link (no login required). Priority: must-have

### Claims

- FR-009: Participant can claim an available item by entering a nickname. Priority: must-have

- FR-010: Participant can unclaim an item they previously claimed. Priority: must-have

- FR-011: An item with quantity = 1 (or no quantity) can be claimed by exactly one participant. An item with quantity > 1 can be claimed by multiple participants until the full quantity is covered. Priority: must-have
  > Socrates: User clarified: if an item has quantity > 1, multiple participants can claim portions of that item until the full quantity is covered. This is a core domain rule — see Business Logic.

### Real-time

- FR-012: All connected participants see claim changes in real time without page refresh. Priority: must-have
  > Socrates: Counter-argument considered: "polling is simpler." Resolution: no counter-argument accepted — real-time is the product's key differentiator. Must-have.

### Comments

- FR-013: Participant can add a comment on an item (e.g. "I'll bring 2 Colas"). Priority: nice-to-have
  > Socrates: Counter-argument considered: "comments distract from the core claim mechanic." Resolution: FR-013 and FR-014 demoted to nice-to-have.

- FR-014: Comments are visible to all participants in real time without page refresh. Priority: nice-to-have

## Non-Functional Requirements

- The event page loads within 2 seconds on a typical mobile connection (4G / moderate Wi-Fi).
- A claim action is reflected to all connected participants within 1 second of being made.
- The app is fully functional on current mobile browsers (Chrome for Android, Safari for iOS) without requiring a native app install.
- Participant nicknames are event-scoped only — no personally identifiable information is stored beyond what a participant explicitly enters within an event session.
- The event link is the sole access control for participants — by design, not an oversight. Anyone with the link can view and claim items.

## Business Logic

Items without a quantity field are binary: they can be claimed by exactly one participant and are unavailable once claimed. Items with a quantity > 1 support multiple partial claims: each participant claims a number of units, and the item remains partially available until all units are claimed. Both hosts and participants see identical real-time claim state — who claimed how many units of each item.

Supporting detail:
- A claim records: participant nickname, item reference, and (for quantity items) the number of units claimed.
- An item's availability state is: unclaimed / partially claimed / fully claimed.
- Availability is computed from total quantity minus sum of all current claims. When a participant unclaims, the units return to available.
- The link to an event expires 3–6 months after the event's date. After expiry, the event becomes read-only (no new claims); the host still has access via their account.

## Access Control

Two-tier flat model:

**Host** — authenticated via email + password. Can create events, generate the shareable link, manage the item list (add / edit / delete items), and delete the event. One account = one or more events.

**Participant** — no account. Enters via the shared link, provides a nickname, and can claim items, unclaim items, and add comments on items. Participants cannot add new items to the list, cannot edit the host's items, and cannot delete anything.

No co-host role, no admin role, no guest-read-only tier. The MVP access model is: authenticated host, anonymous-but-named participants. An unauthenticated user who hits the base URL (without an event link) sees a landing page only — no event data exposed.

## Non-Goals

- **No payment or expense splitting.** The app tracks who brings what, not who owes what. Cost tracking, bill splitting, and Splitwise-like features are out of scope — they would double the domain complexity without serving the core coordination problem.
- **No external integrations.** No WhatsApp bot, no Slack integration, no Google Calendar sync, no SMS gateway. The app is self-contained; users share the link themselves via whatever channel they use today.

## Open Questions

1. **What is the expected requests-per-second ballpark?** — `target_scale.qps` not captured during shaping. Owner: user. Needed before tech-stack selection to size infrastructure. By: before `/10x-tech-stack-selector` runs.

2. **What is the expected data volume ballpark?** — `target_scale.data_volume` not captured during shaping. Owner: user. Needed before tech-stack selection. By: before `/10x-tech-stack-selector` runs.

3. **What is the exact link expiry window?** — Business logic states "3–6 months after event date" but does not specify the exact value. Owner: user. This is a product decision that affects participant expectations. By: implementation planning.
