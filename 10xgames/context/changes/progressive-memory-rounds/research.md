---
date: 2026-09-01T17:14:58+0000
researcher: Copilot CLI
git_commit: 4425f5406aedcf4eb3256f3cc0055c545cfe97b8
branch: feature/progressive-memory-rounds-slice
repository: mrozowski/10xdev3.0
topic: "Progressive Memory Cards round difficulty (S-03 / progressive-memory-rounds)"
tags: [research, codebase, memory-game, engine, round-progression, difficulty]
status: complete
last_updated: 2026-09-01
last_updated_by: Copilot CLI
---

# Research: Progressive Memory Cards round difficulty

**Date**: 2026-09-01T17:14:58+0000
**Researcher**: Copilot CLI
**Git Commit**: 4425f5406aedcf4eb3256f3cc0055c545cfe97b8
**Branch**: feature/progressive-memory-rounds-slice
**Repository**: mrozowski/10xdev3.0

## Research Question

How is the current Memory Cards game implemented, and what needs to change to deliver S-03: player can advance through progressively harder rounds — first round briefly reveals all cards, later rounds skip the reveal and increase pair count while staying playable on phone/tablet/desktop, and the player can see which round they're on?

## Summary

The game is a single-round experience today: an Astro island (`MemoryGame.astro`) wraps a pure state-machine engine (`engine.ts`) that always builds a **fixed 8-pair (16-card) board** with a 3-second preview, and ends at `'completed'`/`'time_up'` with no continuation. There is **no round concept anywhere** — not in `GameState`, not in local storage. To deliver S-03 we need to: (1) add round number + per-round difficulty (pair count, preview on/off) to the engine, (2) wire a "next round" transition instead of ending the game after one board, (3) make the card grid responsive beyond the current fixed 4-column/520px-max layout since later rounds may reach 20–30 pairs, and (4) grow the theme symbol pool, since only **9 unique symbols** exist today and `createInitialGameState` throws if `totalPairs` exceeds the available symbol count — a hard blocker for the PRD's own example of scaling "from 16 to 20 or 30" pairs.

## Detailed Findings

### Game engine (state machine)

- `src/lib/memory-game/engine.ts` is a pure, framework-free TS module — good isolation, easy to extend without touching Astro/DOM code.
- `GameState` (`engine.ts:16-25`) has no `round`/`roundNumber`/`difficulty` field today. Fields: `status, cards, flippedIndices, score, combo, matchedPairs, totalPairs, previewSecondsRemaining, roundSecondsRemaining`.
- `createInitialGameState(symbolIds, totalPairs = 8)` (`engine.ts:59-94`):
  - Slices `symbolIds` to `totalPairs` and **throws** if fewer symbols exist than pairs requested (`engine.ts:65-69`). This is the concrete blocker for higher pair counts.
  - Always initializes `status: 'preview'` and flips all cards face-up (`engine.ts:76-82`) — i.e. the "reveal" is currently unconditional, not skippable. S-03 needs a way to start a round in `'playing'` directly (no preview) for round 2+.
- `PREVIEW_SECONDS = 3` (`engine.ts:35`) — global constant, not per-round.
- `tickPreview()` (`engine.ts:100-123`) flips cards down and moves `status` to `'playing'` once the countdown hits 0.
- Scoring constants (`engine.ts:37-40`): `BASE_MATCH_POINTS=150`, `COMBO_MULTIPLIER_POINTS=50`, `MISMATCH_PENALTY_POINTS=25`, `TIME_BONUS_PER_SECOND=10`; used inside `calculateFinalScore()` (`engine.ts:156-162`) and the flip/match/mismatch logic (`engine.ts:167-257`).
- Completion check: `const isComplete = nextMatchedPairs >= state.totalPairs` (`engine.ts:210`) sets `status` toward `'completed'`. There is no branch that starts a *new* round — completion is terminal today.
- `ROUND_SECONDS = 60` (`engine.ts:36`) is a single flat per-round timer; later, harder rounds (more pairs) will need this to scale too (an open question — see below).

### UI shell / island (`src/components/game/MemoryGame.astro`, 738 lines)

- Not React/Vue/Svelte — plain Astro component with an inline `<script>` defining a `MemoryGameIsland` class that owns `state: GameState` as an instance field (`MemoryGame.astro:114`) and is instantiated directly (`MemoryGame.astro:361-364`), no `client:load`/`client:only` directives needed since it's already a vanilla client script.
- Hardcodes the engine call: `createInitialGameState(symbolIds, 8)` (`MemoryGame.astro:178-181`) — this is the single call site to change for round-aware pair counts.
- Preview banner + countdown UI at `MemoryGame.astro:32-40`; preview timer loop at `MemoryGame.astro:191-210`.
- Grid rendering at `MemoryGame.astro:248-271`.
- Completion modal only offers **"PLAY AGAIN"**, which restarts a brand-new single game (`MemoryGame.astro:154-159`) — this is the flow that needs a "NEXT ROUND" branch alongside/instead of restart.
- Score persisted on completion via `addScore({ score: this.state.score })` (`MemoryGame.astro:297-302`) — presumably should persist only final/cumulative score across all rounds played, or per-round; needs a product decision (see Open Questions).
- No `round`/`roundNumber` displayed anywhere in the HUD (`MemoryGame.astro:333-337`) — US-03's "player can see which round they are playing" acceptance criterion has no current hook.

### Layout / responsiveness constraints

- Grid is **hardcoded to 4 columns**: `grid-template-columns: repeat(4, 1fr)` (`MemoryGame.astro:486-492`) — built for exactly 16 cards (8 pairs). Not parametrized by pair count.
- Card aspect ratio fixed square via `aspect-ratio: 1/1` (`MemoryGame.astro:494-506`).
- Game wrapper capped at `max-width: 520px` (`MemoryGame.astro:372-382`); outer page bar/panel also capped at 520px (`src/pages/index.astro:146-178`).
- Only one mobile breakpoint exists (`@media (max-width: 480px)`, `MemoryGame.astro:716-726`) and it only tweaks gaps/padding, not column count.
- **Implication**: scaling to 20–30 pairs (40–60 cards) inside a fixed 4-column, 520px-max, square-card grid will produce a very tall, likely broken layout on phones. The grid strategy needs to become round/pair-count aware (e.g., variable column count per breakpoint, or capped max pairs per device class) to satisfy the roadmap's own flagged unknown: "Pair counts and time limits must preserve a playable layout on phones, tablets, and desktop screens."

### Theme / symbol pool

- `src/lib/memory-game/themes.ts` defines exactly **9 symbols** in `DEV_THEME_SYMBOLS` (`themes.ts:17-118`): terminal, code, git-branch, database, cpu, bug, rocket, shield, and one more (verify exact count: 9 objects counted).
- `getThemeSymbolIds()` (`themes.ts:120-129`) just maps IDs; only one theme (`'software-dev'`) exists (`THEMES = ['software-dev']`, `preferences.ts:3`).
- Since `createInitialGameState` throws when `totalPairs > symbolIds.length`, **the engine cannot currently support any round beyond 9 pairs**, let alone the PRD's example of scaling to 20 or 30. This must be resolved during planning — either by adding more symbols per theme, allowing symbol reuse/duplication across pairs (each pair still uses 2 matching cards, but two different pairs could share a symbol id — would need a secondary pair-instance discriminator so matches stay unambiguous), or capping the max pair count below 30 for this iteration.
- Related upcoming change `animals-card-theme` (S-04, roadmap) will add a second theme — worth confirming with that change's owner whether it should also ship with enough symbols for high pair counts, since both slices touch `themes.ts`.

### Local storage / persistence contract

- `src/lib/storage.ts` (22 lines): generic `safeGetItem`/`safeSetItem` wrapper around `localStorage` with try/catch — reusable as-is.
- `src/lib/preferences.ts` (56 lines): stores `{theme, soundEnabled}` under key `10xgames:preferences`. No round-related fields.
- `src/lib/scores.ts` (67 lines): stores up to 10 `ScoreEntry { name, score, date }` under key `10xgames:scores`. No `round` or `roundsCompleted` field exists on `ScoreEntry` — if the product wants to show/save which round a score reflects, this type and its storage/read functions need extending (additive, backward compatible if the field is optional).
- **No existing key at all for**: current round, best round reached, or per-round difficulty state. This is greenfield within the existing contract pattern (`storage.ts` + a small typed module, following `preferences.ts`/`scores.ts` conventions) — a new `rounds.ts` (or extending `engine.ts` state) would be idiomatic.

## Code References

- `src/lib/memory-game/engine.ts:1-40` - types, `GameStatus`, `GameState`, constants (`PREVIEW_SECONDS`, `ROUND_SECONDS`, scoring constants)
- `src/lib/memory-game/engine.ts:59-94` - `createInitialGameState()`, the single point where pair count / symbol count is validated and preview is unconditionally started
- `src/lib/memory-game/engine.ts:100-123` - `tickPreview()`, reveal countdown → `'playing'` transition
- `src/lib/memory-game/engine.ts:156-162` - `calculateFinalScore()`
- `src/lib/memory-game/engine.ts:167-257` - flip/match/mismatch/completion logic, `isComplete` check at line 210
- `src/components/game/MemoryGame.astro:114` - `state: GameState` instance field
- `src/components/game/MemoryGame.astro:178-181` - hardcoded `createInitialGameState(symbolIds, 8)` call
- `src/components/game/MemoryGame.astro:154-159` - "PLAY AGAIN" button handler (restart, not "next round")
- `src/components/game/MemoryGame.astro:191-210` - preview timer loop
- `src/components/game/MemoryGame.astro:248-271` - grid rendering
- `src/components/game/MemoryGame.astro:297-302` - score persistence on completion
- `src/components/game/MemoryGame.astro:333-348` - HUD + victory modal score display (no round indicator)
- `src/components/game/MemoryGame.astro:372-382,486-492,494-506,716-726` - layout constraints: 520px max width, fixed 4-column grid, square cards, single mobile breakpoint
- `src/pages/index.astro:17-23` - mounts `<MemoryGame />`
- `src/pages/index.astro:38-82,146-178` - high-scores panel and its own 520px width cap
- `src/lib/memory-game/themes.ts:17-118` - `DEV_THEME_SYMBOLS`, 9 symbols total
- `src/lib/memory-game/themes.ts:120-129` - `getThemeSymbols()` / `getThemeSymbolIds()`
- `src/lib/preferences.ts:1-56` - theme/sound preferences contract (pattern to follow for new round-state contract)
- `src/lib/scores.ts:1-67` - `ScoreEntry` type and score storage (no round field yet)
- `src/lib/storage.ts:1-22` - generic safe localStorage wrapper

## Architecture Insights

- The engine/UI split (`engine.ts` pure functions + `.astro` island holding state) is intentional and should be preserved: round-progression logic belongs in `engine.ts` as pure state transitions (e.g. a new `startNextRound(state, symbolIds, roundConfig)` function), with `MemoryGame.astro` only orchestrating UI/timers and calling into the engine — consistent with how `tickPreview`, `flipCard`, etc. are already structured.
- Difficulty tuning (pair count per round, whether preview runs) is explicitly called out by the PRD as an **implementation-level decision** ("Exact pair counts and time limits are implementation tuning decisions, provided each round remains playable on every supported device" — PRD line ~120), and the roadmap's S-03 unknown says the same. This means the plan should propose and lock concrete values (e.g., round 1 = 8 pairs + preview, round 2 = 12 pairs no preview, round 3 = 16, etc., capped at whatever the symbol pool and grid can support) rather than leaving them open.
- Local-state contracts consistently follow the pattern: typed module + `storage.ts` wrapper + `is<Type>` runtime guard + default fallback (see `preferences.ts:18-30`, mirrored in `scores.ts`). Any new round-progress persistence should follow the same shape for consistency.
- No test runner is configured in this repo (per repo-wide instructions) — verification for this change will rely on `npm run build`/`npm run astro -- check` plus manual play-testing across breakpoints, not automated unit tests.

## Historical Context (from prior changes)

- `context/changes/first-memory-round/` (status: `impl_reviewed`, roadmap S-01, `done`) delivered the current single-round flow, including the preview/reveal mechanic and scoring this change builds on top of. Its `change.md` confirms scope was "4x4 card grid with initial reveal countdown, pair-matching mechanics ... score calculation, and end-of-round result display" — exactly the mechanics now being extended for multi-round progression, and explains why the grid/engine are still single-round shaped.
- `context/changes/local-score-contract/` (status: `impl_reviewed`, roadmap F-01, `done`) delivered `preferences.ts`/`scores.ts`/`storage.ts` — the reusable pattern to extend for any new round-progress persistence.
- Roadmap (`context/foundation/roadmap.md:106-118`) already documents S-03's outcome, PRD refs (FR-004, FR-008, US-03), and its one open unknown (playable layout across devices as pair count grows) — this research confirms that unknown is real and concrete (fixed 4-column/520px grid + only 9 theme symbols), not hypothetical.
- No `context/foundation/lessons.md` exists yet in this repo, so there are no recorded recurring pitfalls to fold in beyond what's captured here.

## Related Research

- None yet under `context/changes/**/research.md` for this specific slice besides this document. `first-memory-round` and `local-score-contract` do not appear to have their own `research.md` artifacts (only `plan.md`/`change.md` were found).

## Open Questions

1. **Exact difficulty curve**: how many rounds, what pair count per round, and at what round does the preview stop? PRD gives only an example ("from 16 to 20 or 30"); plan must lock concrete values.
2. **Symbol pool ceiling**: current 9 symbols cap `totalPairs` at 9 before `createInitialGameState` throws. Needs a decision: add more symbols to `themes.ts`, allow duplicate/shared symbols across distinct pairs (requires an engine change to keep matches unambiguous), or cap max round difficulty at what 9 symbols support for this iteration.
3. **Responsive grid strategy**: should column count scale with pair count (e.g. 4 → 5 → 6 columns) and/or should max pairs be device-aware (fewer pairs on narrow phones)? Needs concrete breakpoint rules.
4. **Round timer scaling**: does `ROUND_SECONDS = 60` stay flat across all rounds, or scale with pair count? Not specified in PRD/roadmap — a planning decision.
5. **Score/round persistence semantics**: does `scores.ts`'s `ScoreEntry` need a `round`/`roundsCompleted` field, and is score saved per-round or only once at the end of a multi-round session (i.e., what ends the "session" — a loss, or the player choosing to stop)? PRD/roadmap don't fully specify when persistence happens relative to round transitions.
6. **Coordination with S-04 (`animals-card-theme`)**: both slices touch `themes.ts`; worth confirming sequencing/ownership so symbol-pool growth isn't done twice inconsistently.
