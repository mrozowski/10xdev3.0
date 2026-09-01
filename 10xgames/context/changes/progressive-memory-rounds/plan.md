# Progressive Memory Cards Round Difficulty Implementation Plan

## Overview

Extend the existing single-round Memory Cards game into a 5-round progression (`progressive-memory-rounds` / S-03). Round 1 keeps today's behavior (8 pairs, 3-second preview reveal). Rounds 2-5 skip the preview and increase difficulty (10, 12, 14, 16 pairs). The player always sees which round they're on, the round timer stays flat per round, and the cumulative score is saved locally once when the 5-round session ends (by finishing round 5, or by running out of time on any round).

## Current State Analysis

- `src/lib/memory-game/engine.ts` is a pure, framework-free state machine already covering: preview countdown (`PREVIEW_SECONDS = 3`), a flat 60s round timer (`ROUND_SECONDS`), flip/match/mismatch logic, and scoring. `GameState` has no `round` concept; `createInitialGameState(symbolIds, totalPairs = 8)` always starts in `'preview'` and throws if `totalPairs` exceeds the symbol pool. Full test coverage exists in `engine.test.ts`.
- `src/lib/memory-game/themes.ts` defines exactly **8** `DEV_THEME_SYMBOLS` (confirmed by `themes.test.ts`'s "provides exactly 8 unique symbols" assertion) — that's precisely enough for today's 8-pair round and nothing more.
- `src/components/game/MemoryGame.astro` is a vanilla-JS Astro island (`MemoryGameIsland` class) owning `state: GameState`. It hardcodes `createInitialGameState(symbolIds, 8)`, renders a fixed 4-column CSS grid inside a 520px-max-width wrapper, and ends every game at `'completed'`/`'time_up'` with a single "PLAY AGAIN" modal button that fully restarts.
- `src/lib/scores.ts` stores up to 10 `ScoreEntry { name, score, date }` entries; `addScore()` is called once per game today, on `'completed'`.
- `src/pages/index.astro` mounts `<MemoryGame />` inside a `.game-top-bar` capped at the same 520px width, and renders the high-scores list.
- No round/session state exists anywhere (engine, storage, or UI) — this is additive work following the same typed-module + `storage.ts` wrapper pattern already used by `preferences.ts`/`scores.ts`.
- `vitest` (jsdom environment) is configured and used for all `src/lib/**` modules; there is no test coverage of `.astro` files.

## Desired End State

- A player who completes round 1 (8 pairs, with preview) advances through rounds 2-5 (10, 12, 14, 16 pairs, no preview), sees a "ROUND N/5" indicator throughout, and their score carries across rounds.
- Finishing round 5 shows a final victory modal and saves one cumulative `ScoreEntry` (with a `roundsCompleted` field) to local storage.
- Running out of time on any round immediately ends the session, shows a game-over modal, and saves one cumulative score reflecting the rounds actually completed.
- The card grid stays playable at all 5 difficulty levels (16 to 32 cards) on phones, tablets, and desktop.

**Verification**:
- `npm run test` passes all unit tests (engine, themes, scores).
- `npm run astro -- check` passes with zero type errors.
- `npm run build` succeeds cleanly.
- Manual testing verifies the full 5-round progression, the preview-only-on-round-1 rule, the round indicator, responsive grid behavior across breakpoints, and correct score persistence on both a full win and a mid-progression loss.

### Key Discoveries:

- `createInitialGameState()` throws when `totalPairs` exceeds available symbols (`engine.ts:65-69`) — the symbol pool must grow before round 5 (16 pairs) is reachable.
- The engine/UI split (pure `engine.ts` transitions, `.astro` island only orchestrating DOM/timers) is the established pattern to preserve — round-progression logic belongs in `engine.ts`, not in `MemoryGame.astro`.
- The grid is presently sized for exactly 16 cards (`grid-template-columns: repeat(4, 1fr)` at `MemoryGame.astro:486-492`, `max-width: 520px` at `MemoryGame.astro:372-382`) — both need to become pair-count aware.
- `addScore()` is currently called exactly once per game, at `'completed'` (`MemoryGame.astro:297-302`) — this call site moves to only fire at true session end (round 5 completion or any `time_up`), never at an intermediate round transition.

## What We're NOT Doing

- No changes to the difficulty curve beyond 5 rounds (8→10→12→14→16 pairs) — a 6th round or endless scaling is out of scope.
- No per-round score entries — only one cumulative `ScoreEntry` is saved per session.
- No retry-same-round-on-loss or "continue after time_up" behavior — running out of time always ends the session.
- No new sound effect for round transitions — the existing `victory` cue is reused.
- No animals theme or second theme (that's `animals-card-theme` / S-04, a parallel change).
- No device-detection-based pair-count capping — the same 5-round curve runs on every device; only the grid's column count adapts.

## Implementation Approach

Build in 4 phases, following the codebase's existing layering (engine → data → UI):
1. **Engine**: add the round-progression state machine (`round_complete` status, `ROUND_DIFFICULTY` curve, `startRound()`), fully unit-tested.
2. **Themes**: expand the symbol pool from 8 to 16 so round 5 is reachable.
3. **Scores**: add an optional `roundsCompleted` field to the score contract.
4. **Game UI**: wire the round HUD, the round-complete vs. session-end modal flows, and the responsive grid.

## Critical Implementation Details

- **State sequencing on round completion**: when the last pair of a round is matched, compute the round's time bonus (`calculateFinalScore`) and carry that *total* forward as the next round's starting score — do not reset score to 0 between rounds. Only `combo` and `matchedPairs` reset per round; `score` is cumulative across the whole session.
- **Modal reuse across three end states**: the existing single `#game-modal` (and its one `#btn-play-again` button) is reused for all three outcomes — round-complete (button relabeled "NEXT ROUND", advances via `startRound(round+1, ...)`), full victory (round 5 done), and time-up (loss). Track which behavior the button should trigger with a small instance-level mode flag; do not create separate modal markup per outcome.
- **Responsive grid columns are computed in JS, not pure CSS breakpoints**: because column count depends on both viewport width *and* the round's pair count (two independent inputs), compute the column count in the island's script (`computeColumns(totalPairs)`, using `matchMedia('(max-width: 480px)')` for the narrow case) and apply it via `gridEl.style.gridTemplateColumns`. Recompute on a debounced `resize`/`orientationchange` listener so an in-progress round stays playable if the viewport changes (e.g. phone rotation).

## Phase 1: Engine round-progression model

### Overview

Add round-aware state to the pure game engine: a `round_complete` status distinct from final `completed`, a fixed 5-round difficulty curve, and a `startRound()` transition that carries score forward and skips the preview for rounds 2-5.

### Changes Required:

#### 1. Round difficulty curve and state shape

**File**: `src/lib/memory-game/engine.ts`

**Intent**: Introduce the fixed 5-round difficulty curve (8→10→12→14→16 pairs, preview only on round 1) as data, and extend `GameState` so the engine and UI both know which round is active and how many rounds the session has.

**Contract**:
- Add `GameStatus` value `'round_complete'` (distinct from `'completed'`, which now means "final round finished").
- Add to `GameState`: `round: number` (1-based) and `roundsTotal: number`.
- Add `FlipEvent` value `'round_complete'`.
- Export `ROUND_DIFFICULTY: ReadonlyArray<{ round: number; totalPairs: number; skipPreview: boolean }>` with exactly 5 entries: `{1,8,false}, {2,10,true}, {3,12,true}, {4,14,true}, {5,16,true}`.
- Export `TOTAL_ROUNDS = ROUND_DIFFICULTY.length` (5).

#### 2. Round-aware initial state and the `startRound` transition

**File**: `src/lib/memory-game/engine.ts`

**Intent**: Let `createInitialGameState` build a round with a carried-over score and an optional skipped preview, without breaking its existing default (single-round, `totalPairs=8`, preview shown) behavior that current tests rely on.

**Contract**:
- Extend `createInitialGameState(symbolIds: string[], totalPairs: number = 8, options: { round?: number; roundsTotal?: number; initialScore?: number; skipPreview?: boolean } = {})`. Defaults (`round: 1, roundsTotal: 1, initialScore: 0, skipPreview: false`) reproduce today's exact behavior, so existing calls and tests (`createInitialGameState(TEST_SYMBOLS, 8)`) are unaffected.
- When `skipPreview` is true: initial `status` is `'playing'` (not `'preview'`), all cards start `isFlipped: false`, `previewSecondsRemaining: 0`.
- `score` initializes to `initialScore` instead of always `0`.
- Add `startRound(round: number, symbolIds: string[], previousScore: number = 0): GameState` — looks up the matching entry in `ROUND_DIFFICULTY` (clamping to the last entry if `round` exceeds `TOTAL_ROUNDS`) and calls `createInitialGameState` with that entry's `totalPairs`/`skipPreview`, plus `round`, `roundsTotal: TOTAL_ROUNDS`, and `initialScore: previousScore`. This is the function the UI calls; `createInitialGameState` remains the lower-level primitive.

#### 3. Round-complete vs. final-completion branching

**File**: `src/lib/memory-game/engine.ts`

**Intent**: When the last pair of a round is matched, distinguish "this round is done, more remain" from "the whole session is done" so the UI can offer "next round" instead of ending the game.

**Contract**: In `flipCard()`'s match branch, when `nextMatchedPairs >= state.totalPairs`: compute `finalScore = calculateFinalScore(nextScore, state.roundSecondsRemaining)` as before, but set `status`/`event` to `'completed'` only when `state.round >= state.roundsTotal`; otherwise set both to `'round_complete'`. In both cases the resulting `score` field is `finalScore` (so it's ready to be passed as `previousScore` into the next `startRound()` call, or persisted immediately if this was the final round).

### Success Criteria:

#### Automated Verification:

- [ ] Unit tests pass: `npm run test`
- [ ] Type checking passes: `npm run astro -- check`

#### Manual Verification:

- [ ] N/A for this phase (pure engine logic, fully covered by automated tests)

---

## Phase 2: Theme symbol pool expansion

### Overview

Grow the `software-dev` theme from 8 to 16 symbols so round 5's 16-pair board is reachable, following the existing hand-authored inline-SVG style.

### Changes Required:

#### 1. Eight additional theme symbols

**File**: `src/lib/memory-game/themes.ts`

**Intent**: Add 8 new `ThemeSymbol` entries to `DEV_THEME_SYMBOLS`, bringing the total to 16, so `createInitialGameState`/`startRound` never throws for any round in `ROUND_DIFFICULTY`.

**Contract**: Add entries with these new `id`s (each with a unique `name`, a distinct neon hex `color`, and an inline SVG fragment matching the existing style constraints documented in the file header — 24x24 viewBox, explicit fills/strokes, no `currentColor`, imagery only, no text): `keyboard`, `monitor`, `folder`, `cloud`, `network`, `lock`, `mouse`, `server`.

#### 2. Update existing theme tests for the new count

**File**: `src/lib/memory-game/themes.test.ts`

**Intent**: The existing assertions hardcode "exactly 8 symbols" and a fixed 8-element ID array — both must reflect the new 16-symbol pool.

**Contract**: Update the `toHaveLength(8)` / `uniqueIds.size` assertions to `16`, and update the `getThemeSymbolIds` expected array to all 16 IDs in their declared order (existing 8 unchanged, followed by the 8 new ones).

### Success Criteria:

#### Automated Verification:

- [ ] Unit tests pass: `npm run test`
- [ ] Type checking passes: `npm run astro -- check`

#### Manual Verification:

- [ ] Each new symbol renders as recognizable, distinct artwork at mobile card size (not just visually valid SVG)

---

## Phase 3: Score contract round tracking

### Overview

Extend the local score contract so a saved score can optionally record how many rounds were completed in that session.

### Changes Required:

#### 1. Optional `roundsCompleted` field

**File**: `src/lib/scores.ts`

**Intent**: Let callers record how many rounds a session completed without breaking any stored entries that predate this field.

**Contract**: Add optional `roundsCompleted?: number` to both `ScoreEntry` and `NewScoreEntry`. Update `isScoreEntry()` so the field is accepted when present and type-checked (`typeof === 'number' && Number.isFinite`), but not required — entries without it (existing stored data) remain valid. `addScore()` passes `roundsCompleted` through onto the persisted entry when provided, omitting the key entirely when not.

#### 2. Extend score tests for the new field

**File**: `src/lib/scores.test.ts`

**Intent**: Cover both back-compatibility (entries without `roundsCompleted` still round-trip) and the new field being persisted and read back correctly.

**Contract**: Add a test asserting `addScore({ name, score, roundsCompleted })` round-trips the field through `getScores()`, and a test asserting a stored entry lacking `roundsCompleted` still passes `isScoreEntry`/`getScores` validation unchanged.

### Success Criteria:

#### Automated Verification:

- [ ] Unit tests pass: `npm run test`
- [ ] Type checking passes: `npm run astro -- check`

#### Manual Verification:

- [ ] N/A for this phase (pure data contract, fully covered by automated tests)

---

## Phase 4: Game UI integration

### Overview

Wire the engine's round-progression model into `MemoryGame.astro`: a round indicator in the HUD, a round-complete flow that advances to the next round without ending the game, a final victory/game-over flow that persists the cumulative score, and a responsive grid that stays playable from 16 to 32 cards.

### Changes Required:

#### 1. Round HUD indicator

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Show the player which round they're on at all times, satisfying US-03's "player can see which round they are playing" acceptance criterion.

**Contract**: Add a new HUD stat box (`#hud-round`) displaying `"{round}/{roundsTotal}"`, updated in `updateHUD()`. Adjust `.game-hud`'s `grid-template-columns` from `repeat(3, 1fr) auto` to `repeat(4, 1fr) auto` to fit the new box alongside score/combo/timer/sound.

#### 2. Round transition flow replacing single "play again"

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Replace the single-outcome "PLAY AGAIN" flow with three distinct outcomes that share the existing modal markup: round complete (advance), full victory (round 5 done), and time-up (loss) — the latter two both end the session and persist score.

**Contract**:
- Refactor the shared "render grid + start preview-or-timer" bootstrap logic (currently inlined in `startNewGame()`) into a reusable private method (e.g. `beginRound()`) called by both a fresh session start (`startRound(1, symbolIds, 0)`) and round advancement, since round 2+ may start directly in `'playing'` (no preview banner) per the engine's `skipPreview` behavior.
- Add `advanceToNextRound()`: calls `startRound(this.state.round + 1, this.symbolIds, this.state.score)`, hides the modal, and calls `beginRound()`.
- Track instance state for `symbolIds` (currently a local variable in `startNewGame`) so `advanceToNextRound()` can reuse the same theme symbol set.
- In `handleCardClick()`'s event switch, add a `'round_complete'` case: play the existing `victory` sound, show the modal with title `"ROUND {N} COMPLETE!"` and button label `"NEXT ROUND"` wired to `advanceToNextRound()` — do **not** call `addScore()` here.
- The `'completed'` case (now only reachable on the final round) and the `time_up` timer branch both call `addScore({ score: this.state.score, roundsCompleted: <rounds actually finished> })` exactly once — `roundsTotal` for a full win, `this.state.round - 1` for a `time_up` loss (the current round wasn't finished) — then show the modal with button label `"PLAY AGAIN"` wired to a full session restart (`startRound(1, symbolIds, 0)` via `beginRound()`).

#### 3. Responsive grid sizing

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Keep the card grid playable as pair count grows from 8 to 16 (16 to 32 cards) across phone, tablet, and desktop widths.

**Contract**:
- Add `computeColumns(totalPairs: number): number`: on narrow viewports (`matchMedia('(max-width: 480px)').matches`) always return `4`; otherwise return `4` for `totalPairs <= 8`, `5` for `totalPairs <= 10`, and `6` for `totalPairs > 10` (covers 12/14/16).
- Apply the computed value via `gridEl.style.gridTemplateColumns = \`repeat(${cols}, 1fr)\`` whenever a round begins, and recompute (debounced) on `resize`/`orientationchange` so an in-progress round adapts if the viewport changes.
- Widen `#memory-game-root`'s `max-width` from `520px` to `640px` so 5-6 column layouts have comfortable card sizes.

#### 4. Keep the page shell width in sync

**File**: `src/pages/index.astro`

**Intent**: Avoid a visual mismatch between the widened game island and the page chrome around it.

**Contract**: Update `.game-top-bar` and `.scores-panel`'s `max-width` from `520px` to `640px` to match the game island's new width.

### Success Criteria:

#### Automated Verification:

- [ ] Type checking passes: `npm run astro -- check`
- [ ] Production build succeeds: `npm run build`

#### Manual Verification:

- [ ] Round 1 shows the 3-second preview; rounds 2-5 skip it and start face-down immediately
- [ ] Round indicator ("ROUND N/5") updates correctly through a full 5-round playthrough
- [ ] Score visibly carries over between rounds (not reset to 0)
- [ ] Completing round 5 shows a victory modal and saves exactly one score entry with `roundsCompleted: 5`
- [ ] Letting the timer run out mid-progression (e.g. round 3) ends the session immediately and saves one score entry with `roundsCompleted: 2`
- [ ] Card grid remains playable (no overflow, cards stay tappable) at 16, 20, 24, 28, and 32 cards on a narrow phone width (~375px), a tablet width (~768px), and desktop
- [ ] Rotating a phone mid-round adapts the column layout without breaking game state

---

## Testing Strategy

### Unit Tests:

- Engine: round curve lookups, `startRound()` score carry-over, `skipPreview` initial state, `round_complete` vs `completed` branching at every round boundary.
- Themes: symbol count/uniqueness at 16, SVG/color validity for all 8 new entries.
- Scores: `roundsCompleted` round-trips, backward compatibility with entries lacking the field.

### Integration Tests:

- None (no test runner covers `.astro` component behavior in this repo) — covered by manual testing instead.

### Manual Testing Steps:

1. Play a full 5-round session to victory; verify round indicator, preview-only-on-round-1, score carry-over, and the single final score save.
2. Let the timer expire on round 1, then again on round 3, verifying `roundsCompleted` is `0` and `2` respectively.
3. Resize/rotate the viewport mid-round at each round's pair count to confirm the grid stays usable.

## Performance Considerations

No new network requests or assets beyond inline SVG (consistent with the existing theme's approach); page-load weight is unaffected since all new symbols are inline vector markup, not image downloads.

## Migration Notes

`ScoreEntry` records saved before this change lack `roundsCompleted`; the updated `isScoreEntry` guard treats the field as optional so existing local-storage data keeps working without migration.

## References

- Related research: `context/changes/progressive-memory-rounds/research.md`
- Roadmap item: S-03 in `context/foundation/roadmap.md`
- Prior implementation: `context/changes/first-memory-round/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Engine round-progression model

#### Automated

- [x] 1.1 Unit tests pass: `npm run test` — 7682b09
- [x] 1.2 Type checking passes: `npm run astro -- check` — 7682b09

### Phase 2: Theme symbol pool expansion

#### Automated

- [x] 2.1 Unit tests pass: `npm run test`
- [x] 2.2 Type checking passes: `npm run astro -- check`

#### Manual

- [ ] 2.3 Each new symbol renders as recognizable, distinct artwork at mobile card size

### Phase 3: Score contract round tracking

#### Automated

- [ ] 3.1 Unit tests pass: `npm run test`
- [ ] 3.2 Type checking passes: `npm run astro -- check`

### Phase 4: Game UI integration

#### Automated

- [ ] 4.1 Type checking passes: `npm run astro -- check`
- [ ] 4.2 Production build succeeds: `npm run build`

#### Manual

- [ ] 4.3 Round 1 shows the 3-second preview; rounds 2-5 skip it and start face-down immediately
- [ ] 4.4 Round indicator ("ROUND N/5") updates correctly through a full 5-round playthrough
- [ ] 4.5 Score visibly carries over between rounds (not reset to 0)
- [ ] 4.6 Completing round 5 shows a victory modal and saves exactly one score entry with `roundsCompleted: 5`
- [ ] 4.7 Letting the timer run out mid-progression (e.g. round 3) ends the session immediately and saves one score entry with `roundsCompleted: 2`
- [ ] 4.8 Card grid remains playable at 16, 20, 24, 28, and 32 cards on phone, tablet, and desktop widths
- [ ] 4.9 Rotating a phone mid-round adapts the column layout without breaking game state
