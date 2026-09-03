---
project: "10x Games"
version: 2
status: active
created: 2026-08-31
updated: 2026-09-03
prd_version: 2
main_goal: speed
top_blocker: time
milestone_id: fruit-rush-game
milestone_seq: 3
milestone_status: open
---

# Roadmap: 10x Games

> Derived from `context/foundation/prd.md` + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-01: Memory Cards MVP** — Status: done

- **Intent:** Deliver a complete, private, instant-play Memory Cards experience that works on common devices and proves the product's core promise without backend infrastructure.
- **Source materials:** `context/foundation/prd.md` (v1)
- **Done when:** every F-01 and S-01, S-02, S-03, S-05 below is `done`.
- **Scope anchors:**
  - FR-001 through FR-008, US-01 through US-03

**M-02: CRUD local score management** — Status: done

- **Intent:** Add local scores system a clear CRUD resource while adding useful local play statistics and preserving the
  no-account, no-backend product direction.
- **Source materials:** `context/foundation/prd.md` (v2)
- **Done when:** S-06 below is `done` with tests covering the score/statistics
  CRUD risk.
- **Scope anchors:**
  - FR-004, FR-007, CRUD requirement

**M-03: Additional games** — Status: done

- **Intent:** Expand the catalogue with a second complete game while preserving
  instant, private, device-local play and isolated game implementations.
- **Source materials:** `context/foundation/prd.md` (v2),
  `context/changes/fruit-rush-game/change.md`
- **Done when:** S-07 below is `done` with deterministic engine/adapter unit
  tests and successful manual browser acceptance covering launch and core play.
- **Scope anchors:**
  - FR-001, FR-004, FR-007, platform growth direction

## Vision recap

The product promises instant, private play for a short break: a player should be able to open the site, choose Memory Cards, and start a complete, progressively harder game without sign-up or installation. The MVP stays deliberately narrow: one polished retro game with local score storage, and no backend or account system. Post-MVP growth is expected to come from adding new games, not new Memory Cards themes.

## North star

**S-01: Player can start and complete a first Memory Cards round** — this is the smallest end-to-end proof that the product works and validates the instant-play promise behind the roadmap.

> The north star — the smallest end-to-end slice that proves the core product hypothesis — sits early because everything else only matters if this path is actually fun and reliable.

## At a glance

| ID | Change ID | Outcome (user can …) | Prerequisites | PRD refs | Status |
| ----- | ---------------------- | --------------------------------- | ---------------- | -------------- | -------- |
| F-01 | local-score-contract | (foundation) track theme choices and locally saved scores under a frictionless name flow | — | FR-003, FR-007, US-02 | done |
| S-01 | first-memory-round | choose Memory Cards, set theme/sound, and complete a first round | F-01 | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01 | done |
| S-02 | local-score-replay | save a completed-round score locally and replay without losing progress | F-01, S-01 | FR-004, FR-007, US-02 | done |
| S-03 | progressive-memory-rounds | advance through increasingly difficult Memory Cards rounds | S-01 | FR-004, FR-008, US-03 | done |
| S-05 | game-catalogue-launcher | choose Memory Cards from the game catalogue and return to it after play | S-01 | FR-001, US-01 | done |
| S-06 | local-score-stats-crud | manage per-game scores and local play statistics without an account | F-01, S-02, S-05 | FR-004, FR-007, course MVP CRUD requirement | done |
| S-07 | fruit-rush-game | launch and play a physics-based fruit-merging game from the catalogue | S-05, S-06 | FR-001, FR-004, FR-007 | done |

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
- **Status:** done

### S-03: Player can advance through progressively harder Memory Cards rounds

- **Outcome:** user can complete consecutive rounds that become harder: the first round briefly reveals cards, while later rounds remove that reveal and increase the number of pairs.
- **Change ID:** progressive-memory-rounds
- **PRD refs:** FR-004, FR-008, US-03
- **Prerequisites:** S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Pair counts and time limits must preserve a playable layout on phones, tablets, and desktop screens. Owner: team. Block: no.
- **Risk:** Difficulty that rises too sharply or produces an unusable board on smaller screens undermines the short, approachable play experience.
- **Status:** done

### S-05: Player can launch Memory Cards from the game catalogue

- **Outcome:** user can see the game catalogue, launch Memory Cards from its catalogue card, and return to the catalogue after play.
- **Change ID:** game-catalogue-launcher
- **PRD refs:** FR-001, US-01
- **Prerequisites:** S-01
- **Parallel with:** S-03
- **Blockers:** —
- **Unknowns:**
  - The transition and return affordance must preserve the instant-play feel on mobile and desktop. Owner: team. Block: no.
- **Risk:** A heavy launcher flow could add friction, while no catalogue boundary makes future games require restructuring.
- **Status:** done

### S-06: Player can manage per-game local scores and stats

- **Outcome:** user can view a score table inside each game, rename a saved
  score label, delete individual scores, clear scores for the current game,
  and view/clear local play statistics such as total play time, total points,
  points per game, time play per game, and last-played dates.
- **Change ID:** local-score-stats-crud
- **PRD refs:** FR-004, FR-007,
- **Prerequisites:** F-01, S-02, S-05
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Shared-device wording must avoid implying account-level privacy. The UI
    should describe scores and stats as local to the current browser profile.
    Owner: team. Block: no.
  - Score tables should be game-scoped now so future games can add their own
    scoreboards without restructuring the storage contract. Owner: team. Block:
    no.
- **Risk:** Requires testing the CRUD operations on score resource - a crucial part of the project.
- **Status:** done

### S-07: Player can play Fruit Rush

- **Outcome:** user can launch Fruit Rush from the catalogue, drop fruits into
  a responsive container, merge matching fruits through the progression, see a
  score, and restart after the container fills.
- **Change ID:** fruit-rush-game
- **PRD refs:** FR-001, FR-004, FR-007
- **Prerequisites:** S-05, S-06
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - None. Physics model, rendering approach, input controls, scoring, merge
    ordering, loss condition, asset strategy, and test boundary are resolved in
    the implementation plan. Owner: team. Block: no.
- **Risk:** Continuous physics and cross-device input can make the game
  unreliable or too heavy if the engine is coupled to rendering or uses an
  unnecessary runtime dependency.
- **Status:** done

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
| ---------- | ---------------------- | ----------------------------- | --------------------- | ----- |
| F-01 | local-score-contract | Local score and theme state contract | yes | Minimal foundation for local persistence and settings |
| S-01 | first-memory-round | Memory Cards first full round flow | yes | Implemented |
| S-02 | local-score-replay | Local score persistence and replay loop | yes | Implemented; return-to-catalogue remains scoped to S-05 |
| S-03 | progressive-memory-rounds | Progressive Memory Cards round difficulty | yes | Implemented |
| S-05 | game-catalogue-launcher | Game catalogue launcher and return flow | yes | Implemented |
| S-06 | local-score-stats-crud | Local score CRUD and browser-profile stats | yes | Implemented |
| S-07 | fruit-rush-game | Fruit Rush physics-based merging game | yes | Implemented; completed game is now part of the catalogue |

## Open Roadmap Questions

1. **Round-tuning values are intentionally implementation-level.** Exact pair counts and time limits are now established by `progressive-memory-rounds`, preserving playable layouts across supported devices. — Owner: team. Block: no.

## Parked

- **Animals card theme (S-04, `animals-card-theme`)** — Why parked: product decision to keep Memory Cards to its single software-development theme; no change folder was started, so this slice is dropped rather than deferred. Growth focus shifts to new games instead of new themes.
- **Accounts and cloud score syncing** — Why parked: Access Control and Non-Goals explicitly exclude login and backend-based syncing in favor of private, device-local play.

## Milestone History

- **M-01: Memory Cards MVP** — completed before roadmap v2.
- **M-02: CRUD local score management** — completed on 2026-09-02.
- **M-03: Additional games** — completed on 2026-09-03.

## Done

- **F-01: Local score state and theme configuration contract** — completed.
- **S-01: Player can start and complete a first Memory Cards round** — completed.
- **S-02: Player can save and replay a completed-round score locally** — completed.
- **S-03: Player can advance through progressively harder Memory Cards rounds** — completed.
- **S-05: Player can launch Memory Cards from the game catalogue** — completed.
- **S-06: Player can manage per-game local scores and stats** — completed.
- **S-07: Player can play Fruit Rush** — completed.
