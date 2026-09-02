# Local Score Stats CRUD — Plan Brief

> Full plan: `context/changes/local-score-stats-crud/plan.md`  
> Research: `context/changes/local-score-stats-crud/research.md`

## What & Why

Build local score CRUD and browser-profile stats without adding accounts. This
removes course-compliance uncertainty by making `Score` a clear CRUD resource
while improving the game platform with useful local statistics.

## Starting Point

Scores already support Create/Read through `src/lib/scores.ts`, and Memory Cards
already saves a named score after final victory/time-up. Missing pieces are
stable score IDs, game scoping, Update/Delete/Clear APIs, stats storage, and
in-game management UI.

## Desired End State

Memory Cards shows its own score table and local stats panel below the game
board. Users can rename a score label, delete one score, clear Memory Cards
scores, view browser-profile stats, and clear stats. The catalogue no longer
shows top-score information.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Auth scope | No accounts or passwords | Static MVP has no backend and PRD excludes login; score CRUD solves the course gap directly. | Research |
| CRUD resource | Game-scoped `Score` | Scores are already product-visible and need only Update/Delete to become complete CRUD. | Research |
| Legacy data | No production migration | Project is not in production, so old local dev scores do not need preservation. | Plan |
| Score update | Rename label only | Preserves leaderboard integrity while giving a real Update operation. | Plan |
| Stats semantics | Platform time = page open; game time = game view open | Matches user preference and avoids unnecessary tab-activity detection. | Plan |
| Clearing model | Separate score clear and stats clear | Lets users reset one data type without surprising loss of the other. | Plan |
| UI placement | In-game panel below board | Keeps scoreboards per game and removes score noise from catalogue. | Plan |
| Test target | Unit contracts + one Playwright CRUD/stat smoke | Gives unambiguous course evidence without overbuilding E2E coverage. | Plan |

## Scope

**In scope:**

- `id` + `gameId` score schema.
- Score APIs: create/read/rename/delete/clear per game.
- Stats module for platform time, game time, points, games played, averages, and
  last played.
- In-game Memory Cards score/stat panel.
- Catalogue score-summary removal.
- Vitest coverage plus one Playwright CRUD/stat smoke.

**Out of scope:**

- Accounts, login, passwords, encryption, backend, database, or cloud sync.
- Editing score values, dates, game IDs, or rounds completed.
- Production migration of old localStorage scores.
- Detecting active/focused browser tabs.

## Architecture / Approach

Extend the existing localStorage pattern: typed modules own private keys,
validate JSON, return safe defaults, and persist best-effort through
`safeSetItem()`. `MemoryGame.astro` becomes the UI owner for Memory Cards scores
and stats, while `index.astro` keeps only catalogue launch/return and platform
time tracking.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Score and Stats Data Contracts | Score CRUD APIs, stats storage APIs, Vitest coverage | Wrong schema makes CRUD unstable or future games mix scores |
| 2. In-Game Score and Stats Management UI | Catalogue cleanup, in-game scoreboard, rename/delete/clear, stats display | UI becomes confusing or implies account-level privacy |
| 3. Browser Flow Verification and Roadmap Handoff | Playwright CRUD/stat smoke and final validation | Course evidence remains too implementation-only |

**Prerequisites:** Existing Memory Cards game, local score save/replay, and
catalogue launcher are already done.  
**Estimated effort:** ~2-3 implementation sessions across 3 phases.

## Open Risks & Assumptions

- Score/stat data belongs to the current browser profile; shared browser
  profiles share scores and stats.
- Because the app is not in production, dropping old local dev score data is
  acceptable.
- The in-game panel must remain usable on narrow screens.

## Success Criteria (Summary)

- Local scores visibly support Create, Read, Rename/Update, Delete, and
  Clear-for-game.
- Local stats show meaningful platform/game usage and can be cleared separately
  from scores.
- Unit tests and one Playwright flow prove the CRUD/stat risk addressed by S-06.
