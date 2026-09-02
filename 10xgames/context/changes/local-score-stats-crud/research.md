---
date: 2026-09-02T20:13:21+00:00
researcher: GitHub Copilot CLI
git_commit: 5a91889a3fa7a2d01f051e92ed17c8206a20e787
branch: master
repository: mrozowski/10xdev3.0
topic: "local-score-stats-crud"
tags: [research, codebase, scores, stats, crud, memory-cards]
status: complete
last_updated: 2026-09-02
last_updated_by: GitHub Copilot CLI
---

# Research: local-score-stats-crud

**Date**: 2026-09-02T20:13:21+00:00  
**Researcher**: GitHub Copilot CLI  
**Git Commit**: 5a91889a3fa7a2d01f051e92ed17c8206a20e787  
**Branch**: master  
**Repository**: mrozowski/10xdev3.0

## Research Question

Research the `local-score-stats-crud` change against
`context/foundation/roadmap.md`: how should local score CRUD, per-game
scoreboards, local play statistics, catalogue cleanup, and data-clearing
controls fit the current static Astro game architecture without adding accounts?

## Summary

The right implementation surface is the existing local score system, not an
account system. Scores are already a product-visible local resource with Create
and Read behavior, but they are global, lack stable IDs, and have no Update,
Delete, per-game isolation, or statistics model. S-06 should make scores
game-scoped, add stable score IDs, expose rename/delete/clear operations, move
score UI into the game view, remove score summaries from the catalogue, and add
separate aggregate local statistics stored per game.

The architecture constraint is clear: the project remains static, backend-free,
and no-login. Any UI copy for statistics should describe data as local to the
current browser profile, not as protected personal account data.

## Detailed Findings

### Roadmap scope and product constraints

- S-06 is now the active course-compliance slice: users should manage per-game
  scores and local play statistics without an account
  ([roadmap.md:62](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/context/foundation/roadmap.md#L62),
  [roadmap.md:144-167](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/context/foundation/roadmap.md#L144-L167)).
- The roadmap requires score/stat CRUD tests for S-06 completion
  ([roadmap.md:38-40](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/context/foundation/roadmap.md#L38-L40)).
- The project baseline explicitly has no backend, database, or auth layer
  ([roadmap.md:66-71](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/context/foundation/roadmap.md#L66-L71)).
- The PRD says no login is required and that local names only label high scores
  on a shared device; accounts, cloud sync, backend, and database are excluded
  from MVP scope
  ([prd.md:109-117](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/context/foundation/prd.md#L109-L117)).
- Roadmap source material references
  `context/changes/course-crud-compliance/frame.md`, but that file is currently
  missing from the working tree. Treat the roadmap text itself as the live source
  for S-06 until that reference is restored or removed.

### Current score storage contract

- Scores are currently one global localStorage array under `10xgames:scores`;
  each entry has `name`, `score`, `date`, and optional `roundsCompleted`
  ([scores.ts:3-17](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/scores.ts#L3-L17)).
- `getScores()` reads the array, parses JSON, filters invalid entries, and
  returns an empty list for missing or malformed storage
  ([scores.ts:44-56](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/scores.ts#L44-L56)).
- `addScore()` creates a score, trims the name, falls back to `Anonymous`, adds
  an ISO timestamp, sorts descending by score, and keeps the top 10
  ([scores.ts:59-80](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/scores.ts#L59-L80)).
- The storage wrapper is best-effort localStorage access via `safeGetItem()` and
  `safeSetItem()`; it returns `null` or ignores write errors when storage is
  unavailable
  ([storage.ts:1-20](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/storage.ts#L1-L20)).
- Preferences show the local-state module pattern to reuse: module-owned key,
  strict runtime validation, JSON fallback, immutable defaults, and update helper
  functions that merge existing state
  ([preferences.ts:1-53](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/preferences.ts#L1-L53)).

### Storage gaps for S-06

- There is no stable score identity. `date` is used for highlight heuristics,
  but it is not a safe CRUD identifier because two records can share a timestamp
  and sorting/truncation changes array positions
  ([MemoryGame.astro:191-210](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/components/game/MemoryGame.astro#L191-L210)).
- There is no game discriminator in `ScoreEntry`; future games would share the
  same top-10 list and contaminate one another
  ([scores.ts:3-17](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/scores.ts#L3-L17)).
- The score module exports only `getScores()` and `addScore()`. S-06 needs
  Update/Delete/Clear APIs such as `renameScore()`, `deleteScore()`, and
  `clearScoresForGame()`
  ([scores.ts:44-80](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/scores.ts#L44-L80)).
- Migration should preserve legacy Memory Cards records by assigning
  `gameId: 'memory-cards'` and generated stable IDs. Requiring new fields without
  migration would drop valid existing local scores.

### Catalogue and game UI flow

- `src/pages/index.astro` owns both the catalogue and the global footer score
  panel. It renders a catalogue score summary and a footer `TOP SCORES` list
  ([index.astro:18-55](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/pages/index.astro#L18-L55)).
- The catalogue imports `getScores()` and `getGameTopScoreSummary()`, renders
  high scores from page-level script, and listens for
  `memory-game:scores-updated`
  ([index.astro:57-132](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/pages/index.astro#L57-L132)).
- S-06 says score tables belong inside each game. The catalogue score summary
  and footer high-score list should therefore be removed from the landing page
  or replaced with non-score/global copy.
- `MemoryGame.astro` owns the game HUD, card grid, completion modal, score-name
  input, and save/replay flow
  ([MemoryGame.astro:7-101](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/components/game/MemoryGame.astro#L7-L101),
  [MemoryGame.astro:181-219](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/components/game/MemoryGame.astro#L181-L219)).
- The in-game score/stat panel should live in `MemoryGame.astro` or in a child
  game-specific component rendered inside the game view. It should refresh after
  save, rename, delete, score clear, stats update, and stats clear.
- New controls should be semantic buttons with accessible names, because the
  existing Playwright tests rely on role locators. Examples: "Rename score for
  Ada", "Delete score for Ada", "Clear Memory Cards scores", and "Clear Memory
  Cards statistics".

### Local statistics model

- No statistics module or storage key exists today. Add a separate local-state
  module instead of overloading score entries.
- Store aggregates per game, not derived values. A practical shape is:
  `totalPlayTimeMs`, `totalPoints`, `gamesPlayed`, and `lastPlayedAt`, keyed by
  `gameId`. Derive "points per game" and "time played per game" from aggregates
  at render time.
- Record stats only at session-ending outcomes, not intermediate round
  completions. Progressive rounds intentionally save one cumulative session
  score when round 5 completes or time expires, while intermediate "NEXT ROUND"
  modals do not persist a score
  ([MemoryGame.astro:299-303](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/components/game/MemoryGame.astro#L299-L303),
  [MemoryGame.astro:407-420](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/components/game/MemoryGame.astro#L407-L420),
  [progressive-memory-rounds/plan-brief.md:27-33](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/context/changes/progressive-memory-rounds/plan-brief.md#L27-L33)).
- S-06 should decide whether abandoned/incomplete play sessions count toward
  time spent. The roadmap asks for play time, total points, points per game,
  time per game, and last-played dates, but does not yet define abandonment
  semantics
  ([roadmap.md:144-167](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/context/foundation/roadmap.md#L144-L167)).

### Test coverage and gaps

- Vitest is configured for `src/**/*.test.ts` in jsdom
  ([vitest.config.ts:4-8](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/vitest.config.ts#L4-L8)).
- Playwright is configured for `tests/` with base URL
  `http://127.0.0.1:4321`, but no `webServer`
  ([playwright.config.ts:3-11](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/playwright.config.ts#L3-L11)).
- Existing score tests cover empty reads, partial validation, Create, sorting,
  top-10 retention, `Anonymous` fallback, special-character names, invalid
  scores, and `roundsCompleted`
  ([scores.test.ts:9-109](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/src/lib/scores.test.ts#L9-L109)).
- Existing browser tests cover catalogue load/start, launch/return, homepage
  load, and save/replay
  ([game-load-and-start.spec.ts:7-29](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/tests/game-load-and-start.spec.ts#L7-L29),
  [seed.spec.ts:5-29](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/tests/seed.spec.ts#L5-L29),
  [local-score-replay.spec.ts:7-48](https://github.com/mrozowski/10xdev3.0/blob/5a91889a3fa7a2d01f051e92ed17c8206a20e787/10xgames/tests/local-score-replay.spec.ts#L7-L48)).
- Gaps: no tests for score Update, Delete, score clear, game isolation,
  statistics recording, statistics clear, legacy migration to `id`/`gameId`, or
  UI-level CRUD controls.

## Code References

- `src/lib/scores.ts:3-17` - Current score entry shape and storage key.
- `src/lib/scores.ts:44-80` - Current Create/Read score APIs.
- `src/lib/storage.ts:1-20` - Safe localStorage wrapper used by local state.
- `src/lib/preferences.ts:1-53` - Local-state validation/update pattern to copy
  for stats.
- `src/lib/catalog.ts:9-24` - Current game summary special-cases Memory Cards
  and reads the global score list.
- `src/pages/index.astro:18-55` - Current catalogue and global score UI.
- `src/pages/index.astro:57-132` - Current score rendering and score-updated
  listener in the page shell.
- `src/components/game/MemoryGame.astro:181-219` - Modal action saves pending
  scores and dispatches score update events.
- `src/components/game/MemoryGame.astro:407-420` - Completed/round-complete
  event handling that distinguishes session-ending save from next-round flow.
- `src/lib/scores.test.ts:9-109` - Existing score contract tests.
- `tests/local-score-replay.spec.ts:7-48` - Existing browser save/replay risk
  coverage.

## Architecture Insights

- Keep scores and stats in typed local-state modules with private storage keys,
  runtime validation, and explicit exported operations.
- Add stable score IDs before implementing Update/Delete. Do not update by list
  index or by score value.
- Keep score facts immutable except the display label: `score`, `date`,
  `roundsCompleted`, and `gameId` are historical record fields; `name`/label is
  the safe Update target.
- Keep statistics separate from score entries. Stats are aggregate usage data,
  while scores are ranked historical records.
- Treat the data owner as the current browser profile. UI copy should avoid
  account language and should warn that shared browser profiles share local
  scores and stats.
- Any rows or controls rendered with `document.createElement()` need global or
  namespaced global CSS because Astro scoped styles do not match runtime-created
  nodes.

## Historical Context

- `context/changes/local-score-contract/plan-brief.md` established localStorage
  as the persistence mechanism and kept the score contract small.
- `context/changes/local-score-replay/plan.md` deferred score persistence until
  the player confirms the modal, preserving replay and local-name behavior.
- `context/changes/progressive-memory-rounds/plan-brief.md` chose one
  cumulative score at session end, not per-round scores.
- `context/changes/game-catalogue-launcher/plan.md` introduced the catalogue as
  a lightweight static view switcher, not a routed/backend game system.
- `context/foundation/lessons.md` records the CSS rule for runtime-created
  markup: use `:global()` or a global stylesheet when component-scoped CSS cannot
  reach dynamically injected nodes.

## Related Research

- `context/changes/local-score-contract/research.md`
- `context/changes/progressive-memory-rounds/research.md`
- `context/changes/testing-pair-matching-contract/research.md`

## Open Questions

1. Should play time include only completed/timed-out sessions, or also abandoned
   sessions when the user returns to the catalogue or closes the tab?
2. Should clearing scores for a game also reset that game's score-derived
   statistics, or should scores and statistics have separate clear controls only?
3. Should legacy scores without `gameId` be migrated in-place immediately, or
   normalized on read and written back on the next mutation?
