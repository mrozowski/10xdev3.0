# Local Score Stats CRUD Implementation Plan

## Overview

Implement local score CRUD and browser-profile statistics for the static 10x
Games MVP. The change makes local scores a clear course-compliance CRUD
resource, moves score management into the Memory Cards game, removes score
output from the catalogue, and adds useful local stats without accounts,
passwords, backend APIs, or cloud sync.

## Current State Analysis

The app already has a strong Memory Cards game loop, local score Create/Read,
and risk-based tests. The missing course-facing piece is explicit Update/Delete
behavior for a resource. Scores currently live in one global localStorage array
without stable IDs or game scoping, and score UI is rendered from the catalogue
page/footer instead of inside the game.

The planning decision is to replace the current pre-production score contract
rather than migrate legacy data. Existing local dev scores can be discarded
because the project is not yet in production.

## Desired End State

After this plan, Memory Cards has an in-game local data panel with:

- a game-scoped score table;
- score Create, Read, Rename/Update, Delete, and Clear-for-game operations;
- browser-profile statistics for platform time, Memory Cards time, games played,
  total points, average points, average game time, and last played;
- a separate stats clear control;
- copy that clearly states data is local to the current browser profile.

The catalogue remains lightweight: it launches Memory Cards and no longer shows
top-score summaries or a global score table. Tests prove score CRUD, per-game
isolation, stats contracts, and one user-visible CRUD/stat flow.

### Key Discoveries:

- `src/lib/scores.ts:3-80` currently exposes only `getScores()` and
  `addScore()` over one global `10xgames:scores` array.
- `src/pages/index.astro:18-132` currently owns catalogue rendering plus global
  top-score/list rendering; S-06 requires scores to move inside each game.
- `src/components/game/MemoryGame.astro:181-219` is the save/replay seam where
  pending scores are persisted and UI refresh events are dispatched.
- `src/components/game/MemoryGame.astro:407-420` distinguishes intermediate
  round completion from final/session-ending completion.
- `context/foundation/lessons.md` requires `:global()` or global CSS for styles
  targeting runtime-created DOM nodes.
- `context/foundation/roadmap.md:144-167` defines S-06 as per-game score
  management and local stats without accounts.

## What We're NOT Doing

- No account creation, login, password storage, encryption, sessions, roles, or
  authentication UI.
- No backend, database, API routes, cloud sync, analytics, or player-data
  collection.
- No production migration for old localStorage score entries; this project is
  pre-production and legacy local scores may be ignored by the new schema.
- No editing of score facts: `score`, `date`, `gameId`, and `roundsCompleted`
  remain immutable after creation. Update means renaming the display label only.
- No global score summary in the catalogue.
- No attempt to detect whether the browser tab is actively focused; time means
  elapsed wall-clock time while the platform/game view is open.

## Implementation Approach

Use the existing local-state pattern: typed modules own private storage keys,
validate parsed JSON, return safe defaults, and persist via `safeSetItem()`.
Extend scores first so CRUD has stable contracts, then add a separate stats
module for aggregate usage data, then wire both into an in-game Memory Cards
panel.

The score resource is the course CRUD anchor. Statistics are a companion local
resource that improves product value and gives the UI a clearer browser-profile
data story.

## Critical Implementation Details

### Timing & lifecycle

Platform time starts when the page script initializes and is flushed
best-effort on unload/pagehide. Memory Cards time starts when the game view is
opened and is flushed when the user returns to catalogue, starts a new session,
or the page unloads. No visibility/focus detection is required.

### State sequencing

Record session-ending stats once when a final `completed` or `time_up` outcome
is reached, not when intermediate `round_complete` modals appear. The score row
is still created when the user confirms the final modal, preserving the existing
deferred score-save behavior.

### User experience spec

All destructive controls need a browser-confirm or equivalent confirmation.
Because there is no account boundary, UI copy must say that scores and stats are
local to the current browser profile and shared by everyone using that profile.

## Phase 1: Score and Stats Data Contracts

### Overview

Replace the global append-only score contract with game-scoped score CRUD and
add a separate local stats module. This phase is mostly TypeScript contracts and
unit tests, with no user-visible UI changes beyond updated consumers needed to
compile.

### Changes Required:

#### 1. Score contract and CRUD APIs

**File**: `src/lib/scores.ts`

**Intent**: Make local scores a complete CRUD resource and prepare the data
model for future games. The old global score array can be replaced because the
project is not in production.

**Contract**: `ScoreEntry` includes `id`, `gameId`, `name`, `score`, `date`, and
optional `roundsCompleted`. `NewScoreEntry` requires `gameId`. Export APIs for
`getScoresForGame(gameId)`, `addScore(entry)`, `renameScore(gameId, id, name)`,
`deleteScore(gameId, id)`, and `clearScoresForGame(gameId)`. Rename uses the
same trim/fallback rule as creation: blank names become `Anonymous`.

#### 2. Score sorting and retention

**File**: `src/lib/scores.ts`

**Intent**: Preserve the existing leaderboard behavior while applying it per
game. A score added for another game must not evict or appear in Memory Cards
results.

**Contract**: Keep only the top 10 scores per `gameId`, sorted by score
descending with stable insertion order as the tie-breaker. Delete and rename
operate by `gameId` + `id`, never by array index, score value, or display name.

#### 3. Stats storage module

**File**: `src/lib/stats.ts`

**Intent**: Track browser-profile usage separately from score records so stats
can be cleared without mutating score history. Store raw aggregates and derive
averages for display.

**Contract**: Add a namespaced storage key such as `10xgames:stats`. Export a
validated stats shape containing `totalPlatformTimeMs` plus per-game aggregates:
`totalPlayTimeMs`, `totalPoints`, `gamesPlayed`, and `lastPlayedAt`. Export
helpers to read stats, record platform time, record game-open/game-time, record
completed session points, clear all stats, and return safe defaults for missing
or malformed storage.

#### 4. Catalogue helper cleanup

**File**: `src/lib/catalog.ts`

**Intent**: Remove the now-obsolete top-score dependency from catalogue helpers.
The catalogue should not need to know score storage details.

**Contract**: Delete `getGameTopScoreSummary()` if no longer used, or reduce
`catalog.ts` to game metadata only if a future catalogue data structure is still
needed. No page should import score APIs solely to render catalogue cards.

#### 5. Unit tests for score CRUD

**File**: `src/lib/scores.test.ts`

**Intent**: Make the course CRUD evidence explicit and protect the storage
contract before UI wiring starts.

**Contract**: Update existing tests for the new `gameId`/`id` schema and add
cases for Create/Read, rename/update, delete-one, clear-for-game, per-game
isolation, blank-name fallback on rename, non-finite score rejection, invalid
stored data handling, and top-10 retention per game.

#### 6. Unit tests for stats

**File**: `src/lib/stats.test.ts`

**Intent**: Prove local statistics can be recorded, read, aggregated, isolated
per game, and cleared independently from scores.

**Contract**: Cover empty defaults, platform time accumulation, game time
accumulation, completed-session points/games played, last-played updates,
per-game isolation, malformed storage fallback, and `clearStats()`.

### Success Criteria:

#### Automated Verification:

- `npx vitest run src/lib/scores.test.ts src/lib/stats.test.ts` passes.
- `npm run test` passes.
- `npm run typecheck` passes.

#### Manual Verification:

- Existing local dev scores can be cleared or ignored without production
  migration concerns.

**Implementation Note**: After completing this phase and all automated
verification passes, pause here for manual confirmation from the human that the
manual testing was successful before proceeding to the next phase.

---

## Phase 2: In-Game Score and Stats Management UI

### Overview

Move score visibility and management into Memory Cards, remove score output from
the catalogue/footer, and wire the new score/stat APIs to user-visible controls.

### Changes Required:

#### 1. Remove catalogue score UI

**File**: `src/pages/index.astro`

**Intent**: Keep the catalogue focused on launching games and avoid mixing
global score state into the landing page.

**Contract**: Remove the game-card score summary element, the footer `TOP
SCORES` panel, score imports, `renderCatalogueSummary()`, `renderHighScores()`,
and page-level `memory-game:scores-updated` score rendering. Keep the catalogue
launch/return behavior intact. Update footer copy to reference browser-profile
local data rather than device-local player identity.

#### 2. Add in-game management panel markup

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Give Memory Cards its own scoreboard and stats area so future games
can own their own local data UI.

**Contract**: Add a panel below the card grid with a heading for Memory Cards
scores, an empty state, a score table/list container, clear-score control,
stats summary, clear-stats control, and browser-profile privacy copy. Controls
must use semantic buttons/labels suitable for Playwright role locators.

#### 3. Render and refresh score rows

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Show current game scores and keep them in sync after save, rename,
delete, and clear operations.

**Contract**: Render rows from `getScoresForGame('memory-cards')`. Each row
shows rank, name, points, optional rounds completed, date, and actions. New row
DOM created in client script must either use namespaced global CSS or be static
enough for Astro scoped styles to apply.

#### 4. Inline rename flow

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Provide the Update operation without allowing score tampering.

**Contract**: A row's Rename action switches only that row into edit mode with
an input, Save, and Cancel. Save calls `renameScore('memory-cards', id, value)`,
then re-renders scores. Cancel restores the read-only row. Blank Save becomes
`Anonymous`.

#### 5. Delete and clear controls

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Provide Delete operations that are clear and safe on shared browser
profiles.

**Contract**: Row Delete confirms before calling
`deleteScore('memory-cards', id)`. Clear scores confirms before calling
`clearScoresForGame('memory-cards')`. Clear stats confirms before calling
`clearStats()`. Each action re-renders the relevant panel and leaves gameplay
usable.

#### 6. Stats lifecycle wiring

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Update stats at the correct lifecycle seams without changing game
rules.

**Contract**: Record `lastPlayedAt` when Memory Cards opens/starts. Accumulate
Memory Cards play time while the game view is open. Record `gamesPlayed` and
`totalPoints` once for final `completed` or `time_up` outcomes. Do not count
intermediate `round_complete` events as completed games.

#### 7. Platform time wiring

**File**: `src/pages/index.astro`

**Intent**: Track total platform time as elapsed wall-clock time while the page
is open, independent of which game is active.

**Contract**: Start a platform timer when the page script initializes and flush
elapsed time through the stats module on pagehide/beforeunload. No tab
visibility, focus, or activity detection is required.

#### 8. Styling for runtime-created rows

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Keep the score/stat panel visually consistent with the retro UI and
avoid the known Astro scoped-style trap.

**Contract**: If score rows are built with `document.createElement()`, place row
and action styles in the existing namespaced `style is:global` block under
`#memory-game-root`. If rows are static Astro markup, scoped styles may be used.

### Success Criteria:

#### Automated Verification:

- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run build` passes.

#### Manual Verification:

- The catalogue shows Memory Cards without a score/top-score summary.
- Memory Cards shows its own score table and stats panel below the game board.
- A saved score can be renamed inline; only the label changes.
- A single score can be deleted without deleting neighboring scores.
- Current-game scores can be cleared without clearing stats.
- Stats can be cleared without clearing scores.
- Browser-profile copy is visible and does not imply account-level privacy.

**Implementation Note**: After completing this phase and all automated
verification passes, pause here for manual confirmation from the human that the
manual testing was successful before proceeding to the next phase.

---

## Phase 3: Browser Flow Verification and Roadmap Handoff

### Overview

Add one browser-level proof that the user-visible CRUD/stat flow works, then
run the final validation set and keep planning artifacts aligned.

### Changes Required:

#### 1. Playwright CRUD/stat smoke test

**File**: `tests/local-score-stats-crud.spec.ts`

**Intent**: Provide clear course-facing evidence that a user can operate the
local score CRUD UI and see stats behavior in the app, not only through module
tests.

**Contract**: Model the spec on `tests/seed.spec.ts` and
`tests/local-score-replay.spec.ts`: role/text/label locators, `test.step`,
isolated storage cleanup, no CSS selectors, no `page.waitForTimeout()`. Cover a
happy path that saves a score, sees it in the in-game table, renames it, deletes
it, and uses at least one stats clear/read assertion.

#### 2. Existing E2E compatibility

**File**: `tests/local-score-replay.spec.ts`

**Intent**: Keep existing save/replay coverage valid after the scoreboard moves
inside Memory Cards.

**Contract**: Update expectations only where UI location or wording changes.
The test should still prove that saving a completed game score preserves the
name and starts a fresh round.

#### 3. Test helpers

**File**: `tests/helpers/test-utils.ts`

**Intent**: Keep E2E state cleanup clear as more localStorage keys are added.

**Contract**: Continue clearing local storage between tests; add named helpers
only if the new tests need seeded score/stat data. Do not introduce shared test
state.

#### 4. Roadmap and change status alignment

**File**: `context/foundation/roadmap.md`

**Intent**: Reflect that S-06 moved from backlog into planning and later can be
advanced by implementation skills.

**Contract**: S-06 status is `planning` in both the At-a-glance row and the
S-06 body after plan creation. Do not mark it done until implementation and
review complete.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- With a dev server running, `npx playwright test tests/local-score-stats-crud.spec.ts tests/local-score-replay.spec.ts --reporter=line` passes.

#### Manual Verification:

- One browser run confirms the CRUD/stat flow is understandable on desktop.
- One narrow mobile-width check confirms the in-game panel remains usable and
  does not push the card grid into an unusable layout.

**Implementation Note**: After completing this phase and all automated
verification passes, pause here for manual confirmation from the human that the
manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- Score Create/Read with new `id` and `gameId` fields.
- Score Rename/Update changes only `name` and preserves immutable score facts.
- Score Delete removes only the selected `gameId` + `id` row.
- Score Clear removes only the selected game's scores.
- Per-game score isolation prevents future-game scores from appearing in Memory
  Cards.
- Invalid stored scores and malformed JSON return safe defaults.
- Stats defaults, platform time, game time, last played, total points, games
  played, averages, malformed storage fallback, and clear behavior.

### Integration Tests:

- Existing `local-score-replay` E2E remains valid after the UI move.
- New `local-score-stats-crud` E2E covers one full user-visible CRUD/stat path.

### Manual Testing Steps:

1. Open the catalogue and confirm Memory Cards has no score summary.
2. Launch Memory Cards and confirm the in-game local data panel is visible.
3. Complete or time out a game, save a score, and confirm it appears in the
   Memory Cards score table.
4. Rename the score, then verify the score value/date/rounds remain unchanged.
5. Delete the renamed score and verify only that row disappears.
6. Clear Memory Cards scores and verify stats remain.
7. Clear stats and verify scores remain.
8. Check browser-profile local-data copy.
9. Repeat a quick visual check at mobile width.

## Performance Considerations

All data remains tiny: top 10 scores per game and one aggregate stats object.
Reads and writes are synchronous localStorage operations already used by the
project. Re-render only the score/stat panel after CRUD operations; do not
hydrate catalogue-only score UI because it is being removed.

## Migration Notes

No production migration is required. The project is not live with user data, so
the new score validator may ignore old entries that lack `id` and `gameId`.
During manual testing, existing local dev storage can be cleared. The new schema
should still fail safely for malformed old data.

## References

- Related research: `context/changes/local-score-stats-crud/research.md`
- Roadmap slice: `context/foundation/roadmap.md`
- Score storage: `src/lib/scores.ts`
- Storage wrapper: `src/lib/storage.ts`
- Preference local-state pattern: `src/lib/preferences.ts`
- Page/catalogue UI: `src/pages/index.astro`
- Memory Cards UI/game lifecycle: `src/components/game/MemoryGame.astro`
- Existing score tests: `src/lib/scores.test.ts`
- Existing E2E save/replay test: `tests/local-score-replay.spec.ts`
- Progress format: `.github/skills/10x-plan/references/progress-format.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Score and Stats Data Contracts

#### Automated

- [x] 1.1 `npx vitest run src/lib/scores.test.ts src/lib/stats.test.ts` passes — 57cfee3
- [x] 1.2 `npm run test` passes — 57cfee3
- [x] 1.3 `npm run typecheck` passes — 57cfee3

#### Manual

- [x] 1.4 Existing local dev scores can be cleared or ignored without production migration concerns — 57cfee3

### Phase 2: In-Game Score and Stats Management UI

#### Automated

- [x] 2.1 `npm run typecheck` passes
- [x] 2.2 `npm run test` passes
- [x] 2.3 `npm run build` passes

#### Manual

- [x] 2.4 The catalogue shows Memory Cards without a score/top-score summary
- [x] 2.5 Memory Cards shows its own score table and stats panel below the game board
- [x] 2.6 A saved score can be renamed inline; only the label changes
- [x] 2.7 A single score can be deleted without deleting neighboring scores
- [x] 2.8 Current-game scores can be cleared without clearing stats
- [x] 2.9 Stats can be cleared without clearing scores
- [x] 2.10 Browser-profile copy is visible and does not imply account-level privacy

### Phase 3: Browser Flow Verification and Roadmap Handoff

#### Automated

- [ ] 3.1 `npm run test` passes
- [ ] 3.2 `npm run typecheck` passes
- [ ] 3.3 `npm run build` passes
- [ ] 3.4 With a dev server running, `npx playwright test tests/local-score-stats-crud.spec.ts tests/local-score-replay.spec.ts --reporter=line` passes

#### Manual

- [ ] 3.5 One browser run confirms the CRUD/stat flow is understandable on desktop
- [ ] 3.6 One narrow mobile-width check confirms the in-game panel remains usable and does not push the card grid into an unusable layout
