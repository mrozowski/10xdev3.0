---
project: "10xBringThis"
version: 1
status: draft
created: 2026-07-06
updated: 2026-07-06
prd_version: 1
main_goal: speed
top_blocker: capacity
---

# Roadmap: 10xBringThis

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

Organizing shared bring-your-own events (parties, BBQs, trips) is chaotic when coordinated over chat: answers get buried, duplicated, or forgotten. 10xBringThis lets a host create an event and share a link; anyone can open it, claim an item with just a nickname (no account), and see live, conflict-free claim status. The **wedge** — the one trait that, if removed, makes this just another shared spreadsheet — is that claiming is as fast as sending a chat message (under 30 seconds, no login) *and* structurally guarantees no two people can claim the same item.

## North star

**S-03: Participant claims/unclaims an item, visible to everyone in real time, with no double-claim** — this is the last link in the chain (F-01 → S-01 → S-02 → S-03) that makes the PRD's Primary Success Criterion literally true end-to-end: a host creates an event and shares a link, and a participant opens it, enters a nickname, and claims an item — all within 60 seconds, reliably.

> A reader-facing note on "north star": it's the smallest end-to-end slice whose successful delivery proves the core product hypothesis. Everything before it (F-01, S-01, S-02) exists only to make S-03 reachable and real; nothing after it matters if S-03 doesn't hold up under concurrent claims.

## At a glance

| ID | Change ID | Outcome (user can …) | Prerequisites | PRD refs | Status |
|---|---|---|---|---|---|
| F-01 | auth-session-scaffold | (foundation) host email+password session auth exists | — | FR-001, FR-002 | proposed |
| F-02 | claim-concurrency-and-realtime-channel | (foundation) concurrency-safe claim writes + per-event SSE broadcast exist | — | FR-011, FR-012, Success Criteria guardrails | proposed |
| F-03 | deploy-skeleton-railway | (foundation) Go binary auto-deploys to Railway via GitHub Actions with a health check | — | NFR (mobile load time), tech-stack.md deploy target | proposed |
| S-01 | host-event-setup | host registers, logs in, creates an event, adds/edits items, and can delete the event | F-01 | FR-001, FR-002, FR-003, FR-004b, FR-006, FR-007, US-01 | proposed |
| S-02 | shareable-link-and-participant-view | host shares a link; anyone can open it and see the live item list with no login | S-01 | FR-005, FR-008, US-01 | proposed |
| S-03 | real-time-item-claiming | participant claims/unclaims an item (or a partial quantity), visible to everyone within ~1s, with no double-claim | S-02, F-02 | FR-009, FR-010, FR-011, FR-012, US-02 | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme | Chain | Note |
|---|---|---|---|
| A | Host & event setup | `F-01` → `S-01` → `S-02` → `S-03` | Main path to the north star; strict must-have order fits the `speed` goal. |
| B | Claim correctness | `F-02` | Joins Stream A at `S-03` — this is the "invest deeply" area (no-double-claim guardrail), built and tested independently so it doesn't block S-01/S-02 work. |
| C | Deploy skeleton | `F-03` | Standalone; can run alongside Stream A from day one so there's no last-minute big-bang deploy under the hard deadline. |

## Baseline

What's already in place in the codebase as of `2026-07-06` (auto-researched + user-confirmed).
Foundations below assume these are absent and scaffold the minimum needed — they do not pre-build entire layers.

- **Frontend:** absent — no templates or HTMX wiring yet (`app/` has no view layer).
- **Backend / API:** absent — `app/cmd/main.go` is a stub (`log.Println` only); no routes, no `net/http` server.
- **Data:** absent — no DB driver, schema, or migrations.
- **Auth:** absent — no session/auth code.
- **Deploy / infra:** absent — no `Dockerfile`, no `.github/workflows`; Railway is the recommended target per `context/foundation/infrastructure.md` but nothing is wired.
- **Observability:** absent — no logging/metrics beyond stdlib `log`.

## Foundations

### F-01: Auth session scaffold

- **Outcome:** (foundation) host email+password registration, login, and logout work via server-side sessions — the minimal login gate S-01 needs, not a full account-management system.
- **Change ID:** auth-session-scaffold
- **PRD refs:** FR-001, FR-002
- **Unlocks:** S-01 (host must be logged in to create an event)
- **Prerequisites:** —
- **Parallel with:** F-02, F-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Sequenced first because every host-facing slice needs a logged-in host; without it S-01 can't even be planned end-to-end. Kept minimal (sessions only, no password reset, no roles) to match the `speed` goal.
- **Status:** ready

### F-02: Claim-concurrency and realtime channel

- **Outcome:** (foundation) a concurrency-safe claim write path (DB-enforced atomic check against remaining quantity — not "read then write" in app code) and a per-event SSE broadcast channel exist and are demonstrably free of double-claims under a scripted concurrent-request test.
- **Change ID:** claim-concurrency-and-realtime-channel
- **PRD refs:** FR-011, FR-012, and the Success Criteria guardrails ("no two participants can claim the same item simultaneously"; "a claim is never silently lost")
- **Unlocks:** S-03 (real-time, no-double-claim item claiming) — this is the single foundation the roadmap's `capacity`-blocker answer says to build once, carefully, rather than re-solve inside a time-pressured slice.
- **Prerequisites:** —
- **Parallel with:** F-01, F-03, S-01
- **Blockers:** —
- **Unknowns:** —
- **Risk:** This is the one place the roadmap deliberately invests deeply (per the interview) because it is the product's core correctness guardrail; getting it wrong silently corrupts claim data. Building and testing it independently of S-01/S-02 means it's proven before S-03 wires it in, reducing risk under the tight timeline.
- **Status:** ready

### F-03: Deploy skeleton (Railway)

- **Outcome:** (foundation) the Go binary builds and auto-deploys to Railway on merge to `main` via GitHub Actions, with a health-check endpoint responding — not a fully tuned production setup, just a working deploy path.
- **Change ID:** deploy-skeleton-railway
- **PRD refs:** NFR ("event page loads within 2 seconds on a typical mobile connection"); `tech-stack.md` (`ci_provider: github-actions`, `ci_default_flow: auto-deploy-on-merge`); `infrastructure.md` (Railway recommendation)
- **Unlocks:** a real, deployed verification path for S-01, S-02, and S-03 — avoids discovering deploy problems for the first time right before the hard deadline.
- **Prerequisites:** —
- **Parallel with:** F-01, F-02, S-01
- **Blockers:** —
- **Unknowns:**
  - What is the expected requests-per-second ballpark? — Owner: user. Block: no (Railway Hobby plan is a safe default regardless; revisit sizing once real usage data exists).
  - What is the expected data volume ballpark? — Owner: user. Block: no (SQLite-on-volume is viable at MVP scale either way).
- **Risk:** Sequenced early (parallel with F-01/F-02, not deferred to the end) specifically because the `speed` goal and hard deadline make a last-minute deploy the single highest-regret failure mode for a solo, after-hours-only builder.
- **Status:** ready

## Slices

### S-01: Host event setup

- **Outcome:** host can register, log in, create an event (name, date, optional description), add/edit/delete items on its bring-list, and delete the event itself.
- **Change ID:** host-event-setup
- **PRD refs:** FR-001, FR-002, FR-003, FR-004b, FR-006, FR-007, US-01
- **Prerequisites:** F-01
- **Parallel with:** F-02, F-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** First user-facing slice — everything downstream (sharing, claiming) needs an event and items to exist. Kept to CRUD-on-your-own-event only; no edit-event convenience (FR-004, nice-to-have) to stay on the must-have path.
- **Status:** proposed

### S-02: Shareable link and participant view

- **Outcome:** host can generate a shareable link for the event; anyone opening that link sees the live item list with no login required.
- **Change ID:** shareable-link-and-participant-view
- **PRD refs:** FR-005, FR-008, US-01
- **Prerequisites:** S-01
- **Parallel with:** F-02, F-03 (if not already landed)
- **Blockers:** —
- **Unknowns:**
  - What is the exact link expiry window (PRD states "3–6 months", not an exact value)? — Owner: user. Block: no (implement with a reasonable default inside the stated range; adjust later — this doesn't block building link generation itself).
- **Risk:** Depends only on S-01 (needs an event and items to link to); no dependency on the claim-concurrency foundation, so it can proceed even if F-02 is still in progress.
- **Status:** proposed

### S-03: Real-time item claiming

- **Outcome:** participant can claim an available item (or a partial quantity of a multi-unit item) by entering a nickname; the claim is visible to every connected participant within ~1 second; no two participants can claim the same unit; a participant can unclaim their own claim.
- **Change ID:** real-time-item-claiming
- **PRD refs:** FR-009, FR-010, FR-011, FR-012, US-02
- **Prerequisites:** S-02, F-02
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** This is the north star — it's the slice where the product's core hypothesis (fast, self-serve, conflict-free coordination) becomes provable. Sequenced last because it needs both a real event+link to claim against (S-02) and the proven concurrency-safe write path (F-02); nothing in its own scope is deferred further.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
|---|---|---|---|---|
| F-01 | auth-session-scaffold | Auth: host email+password session login | yes | — |
| F-02 | claim-concurrency-and-realtime-channel | Foundation: concurrency-safe claims + SSE broadcast | yes | — |
| F-03 | deploy-skeleton-railway | Deploy: Railway + GitHub Actions auto-deploy skeleton | yes | — |
| S-01 | host-event-setup | Host: create/manage event and item list | no | Needs F-01 landed first |
| S-02 | shareable-link-and-participant-view | Participant: view event via shared link, no login | no | Needs S-01 landed first |
| S-03 | real-time-item-claiming | Participant: claim/unclaim items in real time, no double-claim | no | Needs S-02 and F-02 landed first |

This table is the clean handoff to Jira/Linear or any MCP-backed backlog.

## Open Roadmap Questions

1. **What is the expected requests-per-second ballpark?** — Owner: user. Block: F-03 sizing decisions (not blocking, Railway Hobby plan is a safe default).
2. **What is the expected data volume ballpark?** — Owner: user. Block: F-03 sizing decisions (not blocking, SQLite is viable at MVP scale either way).
3. **What is the exact link expiry window (3–6 months stated, no exact value)?** — Owner: user. Block: S-02 (not blocking implementation, but should be confirmed before launch).

## Parked

- **FR-004: Host can edit event name/date/description** — Why parked: explicitly demoted to nice-to-have in the PRD (item-list editing already covers the common case); deferred to keep S-01 on the must-have path given the `speed` goal.
- **FR-013: Participant can add a comment on an item** — Why parked: nice-to-have per PRD; not part of the Primary Success Criterion.
- **FR-014: Comments visible in real time** — Why parked: depends on FR-013, also nice-to-have.
- **Payment / expense splitting** — Why parked: PRD Non-Goal — out of scope by design, doubles domain complexity without serving the core coordination problem.
- **External integrations (WhatsApp/Slack/Calendar/SMS)** — Why parked: PRD Non-Goal — app is self-contained; users share the link via whatever channel they already use.

## Done

