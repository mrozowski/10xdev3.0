---
project: "10x Games"
version: 1
status: active
created: 2026-08-31
updated: 2026-09-01
prd_version: 2
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
- **Done when:** every F-01 and S-01 through S-05 below is `done`.
- **Scope anchors:**
  - FR-001 through FR-009, US-01 through US-04

## Vision recap

The product promises instant, private play for a short break: a player should be able to open the site, choose Memory Cards, and start a complete, progressively harder game without sign-up or installation. The MVP stays deliberately narrow: one polished retro game with multiple visual themes, local score storage, and no backend or account system.

## North star

**S-01: Player can start and complete a first Memory Cards round** — this is the smallest end-to-end proof that the product works and validates the instant-play promise behind the roadmap.

> The north star — the smallest end-to-end slice that proves the core product hypothesis — sits early because everything else only matters if this path is actually fun and reliable.

## At a glance

| ID | Change ID | Outcome (user can …) | Prerequisites | PRD refs | Status |
| ----- | ---------------------- | --------------------------------- | ---------------- | -------------- | -------- |
| F-01 | local-score-contract | (foundation) track theme choices and locally saved scores under a frictionless name flow | — | FR-003, FR-007, US-02 | done |
| S-01 | first-memory-round | choose Memory Cards, set theme/sound, and complete a first round | F-01 | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01 | done |
| S-02 | local-score-replay | save a completed-round score locally, replay, and return to the game list | F-01, S-01 | FR-004, FR-007, US-02 | in-review |
| S-03 | progressive-memory-rounds | advance through increasingly difficult Memory Cards rounds | S-01 | FR-004, FR-008, US-03 | proposed |
| S-04 | animals-card-theme | select and play with an animals card theme | S-01 | FR-003, FR-009, US-04 | proposed |
| S-05 | game-catalogue-launcher | choose Memory Cards from the game catalogue and return to it after play | S-01 | FR-001, US-01 | proposed |

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
- **Status:** done

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

### S-03: Player can advance through progressively harder Memory Cards rounds

- **Outcome:** user can complete consecutive rounds that become harder: the first round briefly reveals cards, while later rounds remove that reveal and increase the number of pairs.
- **Change ID:** progressive-memory-rounds
- **PRD refs:** FR-004, FR-008, US-03
- **Prerequisites:** S-01
- **Parallel with:** S-04
- **Blockers:** —
- **Unknowns:**
  - Pair counts and time limits must preserve a playable layout on phones, tablets, and desktop screens. Owner: team. Block: no.
- **Risk:** Difficulty that rises too sharply or produces an unusable board on smaller screens undermines the short, approachable play experience.
- **Status:** proposed

### S-04: Player can select and play with an animals card theme

- **Outcome:** user can choose animals as a Memory Cards theme and play every round using distinct, recognizable animal card imagery.
- **Change ID:** animals-card-theme
- **PRD refs:** FR-003, FR-009, US-04
- **Prerequisites:** S-01
- **Parallel with:** S-03
- **Blockers:** —
- **Unknowns:**
  - Animal assets must remain lightweight and distinguishable at mobile card sizes. Owner: team. Block: no.
- **Risk:** If animal cards are visually ambiguous or slow the initial game load, the new theme hurts matching clarity and the instant-play promise.
- **Status:** proposed

### S-05: Player can launch Memory Cards from the game catalogue

- **Outcome:** user can see the game catalogue, launch Memory Cards from its catalogue card, and return to the catalogue after play.
- **Change ID:** game-catalogue-launcher
- **PRD refs:** FR-001, US-01
- **Prerequisites:** S-01
- **Parallel with:** S-03, S-04
- **Blockers:** —
- **Unknowns:**
  - The transition and return affordance must preserve the instant-play feel on mobile and desktop. Owner: team. Block: no.
- **Risk:** A heavy launcher flow could add friction, while no catalogue boundary makes future games require restructuring.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
| ---------- | ---------------------- | ----------------------------- | --------------------- | ----- |
| F-01 | local-score-contract | Local score and theme state contract | yes | Minimal foundation for local persistence and settings |
| S-01 | first-memory-round | Memory Cards first full round flow | yes | Implemented |
| S-02 | local-score-replay | Local score persistence and replay loop | no | Awaiting review |
| S-03 | progressive-memory-rounds | Progressive Memory Cards round difficulty | yes | Run `/10x-plan progressive-memory-rounds` |
| S-04 | animals-card-theme | Animals Memory Cards theme | yes | Run `/10x-plan animals-card-theme` |
| S-05 | game-catalogue-launcher | Game catalogue launcher and return flow | yes | Run `/10x-plan game-catalogue-launcher` |

## Open Roadmap Questions

1. **Round-tuning values are intentionally implementation-level.** Establish exact pair counts and time limits during `progressive-memory-rounds`, preserving playable layouts across supported devices. — Owner: team. Block: no.

## Parked

- **Additional games beyond Memory Cards** — Why parked: the PRD's Non-Goals says this is post-MVP and the milestone is intentionally scoped to one complete Memory Cards experience.
- **Accounts and cloud score syncing** — Why parked: Access Control and Non-Goals explicitly exclude login and backend-based syncing in favor of private, device-local play.

## Milestone History

(empty)

## Done

- **F-01: Local score state and theme configuration contract** — completed.
- **S-01: Player can start and complete a first Memory Cards round** — completed.
