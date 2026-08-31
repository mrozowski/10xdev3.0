---
project: "10x Games"
version: 1
status: draft
created: 2026-08-31
updated: 2026-08-31
prd_version: 1
main_goal: speed
top_blocker: time
milestone_id: memory-cards-mvp
milestone_seq: 1
milestone_status: open
---

# Roadmap: 10x Games

> Derived from `context/foundation/prd.md` + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-01: Memory Cards MVP** — Status: open

- **Intent:** Deliver a complete, private, instant-play Memory Cards experience that works on common devices and proves the product's core promise without backend infrastructure.
- **Source materials:** `context/foundation/prd.md` (v1)
- **Done when:** every F-01 and S-01/S-02 below is `done`.
- **Scope anchors:**
  - FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01, US-02

## Vision recap

The product promises instant, private play for a short break: a player should be able to open the site, choose Memory Cards, and start a complete round without sign-up or installation. The MVP stays deliberately narrow: one polished retro game, local score storage, and no backend or account system.

## North star

**S-01: Player can start and complete a first Memory Cards round** — this is the smallest end-to-end proof that the product works and validates the instant-play promise behind the roadmap.

> The north star — the smallest end-to-end slice that proves the core product hypothesis — sits early because everything else only matters if this path is actually fun and reliable.

## At a glance

| ID | Change ID | Outcome (user can …) | Prerequisites | PRD refs | Status |
| ----- | ---------------------- | --------------------------------- | ---------------- | -------------- | -------- |
| F-01 | local-score-contract | (foundation) track theme choices and locally saved scores under a frictionless name flow | — | FR-003, FR-007, US-02 | done |
| S-01 | first-memory-round | choose Memory Cards, set theme/sound, and complete a first round | F-01 | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01 | in-progress |
| S-02 | local-score-replay | save a completed-round score locally, replay, and return to the game list | F-01, S-01 | FR-004, FR-007, US-02 | proposed |

## Baseline

What's already in place in the codebase as of `2026-08-31` (auto-researched + user-confirmed). Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — Astro static-site scaffold already exists in `package.json`, `src/pages/index.astro`, and the app shell.
- **Backend / API:** absent — no server routes, controllers, or API handlers exist.
- **Data:** absent — no database, ORM, schema, or migration tooling is present.
- **Auth:** absent — no auth provider or session middleware is wired in.
- **Deploy / infra:** present — Astro is configured for GitHub Pages in `astro.config.mjs` with `site` and `base` set.
- **Observability:** absent — there is no logging, error tracking, or metrics library in the codebase.

## Foundations

### F-01: Local score state and theme configuration contract

- **Outcome:** (foundation) the app has a minimal local-state contract for theme selection, sound toggles, and persisted score names without backend infrastructure.
- **Change ID:** local-score-contract
- **PRD refs:** FR-003, FR-007, US-02
- **Unlocks:** S-01, S-02
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** The first user-facing loop only works if the app can store score names and theme choices locally without adding backend complexity or blocking replay.
- **Status:** done

## Slices

### S-01: Player can start and complete a first Memory Cards round

- **Outcome:** user can choose Memory Cards, optionally choose a theme and sound, and complete a playable round with a visible score.
- **Change ID:** first-memory-round
- **PRD refs:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01
- **Prerequisites:** F-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - No major product unknowns remain in the PRD; if a new theme or sound requirement appears, it should be treated as a roadmap-wide decision. Owner: team. Block: no.
- **Risk:** If the first round is not reliably playable across mobile and desktop layouts, the product cannot validate its core promise before the rest of the feature work expands.
- **Status:** in-progress

### S-02: Player can save and replay a completed-round score locally

- **Outcome:** user can save a completed-round score under a generated or optional local name, replay immediately, and return to the game list without losing progress.
- **Change ID:** local-score-replay
- **PRD refs:** FR-004, FR-007, US-02
- **Prerequisites:** F-01, S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - No blocking product unknowns remain; UI naming flows and local persistence rules should stay frictionless and local-only. Owner: team. Block: no.
- **Risk:** If score persistence becomes intrusive or blocks replay, the product drifts from its instant-play promise and the local scoring loop will feel heavy instead of frictionless.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
| ---------- | ---------------------- | ----------------------------- | --------------------- | ----- |
| F-01 | local-score-contract | Local score and theme state contract | yes | Minimal foundation for local persistence and settings |
| S-01 | first-memory-round | Memory Cards first full round flow | yes | Run `/10x-plan first-memory-round` |
| S-02 | local-score-replay | Local score persistence and replay loop | no | Depends on the first round flow landing first |

## Open Roadmap Questions

1. **No product blockers are currently outstanding in the PRD.** — Owner: product. Block: roadmap-wide.

## Parked

- **Additional games beyond Memory Cards** — Why parked: the PRD's Non-Goals says this is post-MVP and the milestone is intentionally scoped to one complete Memory Cards experience.
- **Accounts and cloud score syncing** — Why parked: Access Control and Non-Goals explicitly exclude login and backend-based syncing in favor of private, device-local play.

## Milestone History

(empty)

## Done

(empty)
