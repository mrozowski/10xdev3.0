<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Add Fruit Rush physics-based merging game

- **Plan**: context/changes/fruit-rush-game/plan.md
- **Scope**: Phases 1–3 of 4 (all automated Progress items checked; manual Progress items unchecked pending user confirmation; Phase 4 not started)
- **Date**: 2026-09-03
- **Verdict**: REJECTED
- **Findings**: 1 critical, 5 warnings, 2 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | WARNING |
| Safety & Quality | FAIL |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | PASS |

## Findings

### F1 — Physics simulation stalls entirely on high-refresh-rate displays

- **Severity**: ❌ CRITICAL
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: `src/lib/fruit-rush/physics-adapter.ts:108-118`, `src/components/game/FruitRushGame.astro:207-216`
- **Detail**: `step(elapsedMs)` computes `stepCount = Math.floor(elapsedMs / fixedStepMs)` with no leftover-time accumulator, and the caller (`frame()`) passes only the raw per-frame delta (`elapsed = Math.min(64, now - lastFrameAt || 16)`). `fixedStepMs` defaults to `1000/60 ≈ 16.67ms`. On a 120Hz+ display (extremely common on modern phones and laptops), `elapsed` is typically ~8ms, so `Math.floor(8/16.67)` is always `0` — `Matter.Engine.update` is never called and gravity/fruit falling never advances. The game is fully non-functional on any device with a refresh rate above ~60Hz.
- **Fix**: Accumulate leftover time across frames in the adapter (or island) and step while accumulated time ≥ `fixedStepMs`, e.g. keep `this.accumulatorMs += elapsedMs; while (this.accumulatorMs >= this.fixedStepMs) { Matter.Engine.update(...); this.accumulatorMs -= this.fixedStepMs; }` capped by `maxStepsPerFrame`.
- **Decision**: FIXED — added `stepAccumulatorMs` to `FruitRushPhysicsAdapter` (physics-adapter.ts:35, 108-125); accumulates elapsed time across `step()` calls and only advances Matter in whole `fixedStepMs` increments, capped by `maxStepsPerFrame`, resetting the accumulator if it ever exceeds the cap (e.g. after a long tab-hidden pause). Added regression test "accumulates sub-step frame deltas so gravity still advances on high refresh-rate displays" (physics-adapter.test.ts). Full fruit-rush suite (19 tests) and `astro check` pass.

### F2 — Reopening the game resumes the prior board instead of starting fresh

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Scope Discipline
- **Location**: `src/components/game/FruitRushGame.astro:220-228, 230-242`
- **Detail**: The plan's "What We're NOT Doing" list states "No active-board resume or cross-session physics persistence." `ensureAdapter()` reuses the existing adapter instance if one already exists, and `openGame()` never resets the module-level `state`. Closing the Fruit Rush view (switching back to the catalogue) and reopening it resumes the exact same in-progress or game-over board rather than starting a new run. This also diverges from `MemoryGame.astro`, which starts a fresh game on `memory-game:view-opened`.
- **Fix A ⭐ Recommended**: Call `restart()` (or an equivalent state/adapter reset) at the top of `openGame()` so every reopen starts a fresh board, matching Memory Cards' lifecycle and the plan's guardrail.
  - Strength: Matches the sibling game's established pattern exactly; removes the guardrail violation with a one-line addition.
  - Tradeoff: A player who accidentally closes mid-run loses that board permanently (same behavior Memory Cards already has, so likely expected).
  - Confidence: HIGH — `restart()` already exists and is exercised by tests/manual play.
  - Blind spot: Haven't confirmed whether the user actually wants resume-on-reopen as a deliberate UX choice (the plan text says no, but this was never surfaced during manual testing).
- **Fix B**: Keep resume-on-reopen as intentional behavior and update the plan's guardrail text to reflect it.
  - Strength: Preserves current behavior without further code changes.
  - Tradeoff: Leaves a documented scope boundary contradicted by shipped behavior, and diverges from Memory Cards without explanation.
  - Confidence: MEDIUM — depends on user preference, which hasn't been asked.
  - Blind spot: No evidence the user wants this; the plan explicitly rules it out.
- **Decision**: FIXED via Fix A — `openGame()` now calls `restart()` after `ensureAdapter()` succeeds (FruitRushGame.astro:230-238), resetting engine state and rebuilding physics from a fresh board every time the view opens, matching Memory Cards' lifecycle. Verified via `npm run test` (88/88 passing), `astro check` (0 errors), and `npm run build` (succeeds).

### F3 — Engine emits only a single `lastEvent` field, not the planned explicit event stream

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: `src/lib/fruit-rush/engine.ts:151-159, 198-203, 248-261`, `src/lib/fruit-rush/types.ts`
- **Detail**: Phase 1's contract calls for the engine to "emit explicit events for accepted/rejected drops, merges, score changes, and game over." The actual implementation only tracks a single `lastEvent` field that gets overwritten each call, rather than an accumulating/explicit event list. Consumers can only observe the most recent transition, not a full sequence (e.g., a chain of 3 merges in one `dropFruit()` call only exposes the last merge event, not all of them individually).
- **Fix A ⭐ Recommended**: Change `dropFruit`/`resolveBoardState` to return an `events: FruitRushEvent[]` array (accumulating every accepted/rejected/merge/score/game-over event during that call) alongside `state`, and update the island to consume the array.
  - Strength: Matches the plan's contract precisely and gives the island (or future analytics/animation code) full visibility into chained merges.
  - Tradeoff: Touches the engine's public return shape and the island's consumption of it — a moderate, not trivial, edit across `engine.ts` and `FruitRushGame.astro`.
  - Confidence: MED — the merge/scoring logic itself is already correct; this is about surfacing events, not changing behavior.
  - Blind spot: Haven't verified whether the island currently relies on `lastEvent`'s overwrite-per-call behavior anywhere that would break if it became an array.
- **Fix B**: Leave `lastEvent` as-is and treat this as a documented simplification vs. the plan.
  - Strength: No code change; single-value state is simpler and has worked through manual testing.
  - Tradeoff: Chain-merge events beyond the last one are permanently unobservable, and the plan's stated contract remains unmet.
  - Confidence: MED — no current consumer needs the full sequence, but future work (e.g., merge animations, combo sound effects) likely will.
  - Blind spot: Whether roadmap/plan work depends on a full event sequence later.
- **Decision**: FIX B applied — kept single-value `lastEvent` (a documented simplification vs. the plan's "explicit event stream" contract, not a functional bug). Added a doc comment on `lastEvent` in types.ts noting the tradeoff (chain merges beyond the last are unobservable) so future contributors understand it's intentional rather than an oversight.

### F4 — No drop cooldown or active-fruit cap allows unbounded body growth

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: `src/lib/fruit-rush/engine.ts:212-260`, `src/components/game/FruitRushGame.astro:266-282, 308-327`
- **Detail**: `dropFruit()` has no cooldown, spawn-lane-occupancy check, or maximum active-body cap, and the keyboard handler doesn't ignore key-repeat events. A fast clicker or a held Space key can create an unbounded number of unsettled fruits before the danger-line grace timer trips, which both degrades physics/merge-scan performance (`resolveBoardState`'s nested scan) and undermines the game's core "one fruit falls at a time" feel.
- **Fix**: Reject/ignore drops while the previous drop is still unsettled near the spawn lane (or add a short cooldown), and ignore `event.repeat` on the Space key handler.
- **Decision**: SKIPPED — user chose not to fix now.

### F5 — Merge/drop rebuild resets velocity for every fruit on the board

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: `src/components/game/FruitRushGame.astro:177-198`, `src/lib/fruit-rush/physics-adapter.ts:68-82`
- **Detail**: `rebuildPhysicsFromState()` runs on every score change or board-length change (i.e., almost every accepted drop and every merge) and does `adapter.clear()` + `addFruit(id, fruitId, x, y)` for every body — `addFruit` has no velocity parameter, so every fruit on the board (not just the merged ones) has its momentum reset to zero each time this fires. This changes physics feel (cascades stop dead) and could subtly affect merge/settle timing versus a real uninterrupted simulation.
- **Fix**: Extend `addFruit`/the adapter to accept and restore `vx`/`vy` from the snapshot being rebuilt, or avoid a full-world rebuild by only replacing the specific merged bodies (adapter already has `replaceFruits` for this purpose).
- **Decision**: FIXED — `addFruit()` now accepts an optional `{ vx, vy }` velocity and applies it via `Matter.Body.setVelocity` (physics-adapter.ts:68-90); `rebuildPhysicsFromState()` in the island now passes each body's existing `vx`/`vy` from its snapshot (FruitRushGame.astro:177-186) instead of resetting to zero. Verified via `npm run test` (88/88) and `astro check` (0 errors).

### F6 — Shared `types.ts` is missing the planned Contact/Physics-command types

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `src/lib/fruit-rush/types.ts`, `src/lib/fruit-rush/physics-adapter.ts:5-9`
- **Detail**: Phase 1's contract for `types.ts` calls for shared "physics command, and event" types usable across engine, adapter, and island. `FruitRushContact` is currently defined only inside `physics-adapter.ts`, not in the shared `types.ts`, so it isn't actually shared/importable by the engine or tests without reaching into the adapter module (which the boundary test forbids importing from non-adapter files).
- **Fix**: Move `FruitRushContact` (and any other physics-facing DTO shapes referenced outside the adapter) into `types.ts` and have `physics-adapter.ts` import it from there.
- **Decision**: FIXED — moved `FruitRushContact` into `types.ts` (types.ts:24-28) with a doc comment; `physics-adapter.ts` now imports it via `import type { ..., FruitRushContact } from './types'` instead of defining it locally. Note: this type is used only for physics contact detection (not related to score persistence, which already works independently). Verified via `npm run test` (88/88), `astro check` (0 errors), `npm run build` (succeeds).

### F7 — Engine test coverage gaps versus the plan's contract

- **Severity**: ⚪️ OBSERVATION
- **Dimension**: Success Criteria
- **Location**: `src/lib/fruit-rush/engine.test.ts`
- **Detail**: The plan's Phase 1 test contract calls for coverage of "simultaneous contacts" (plural/multi-way) and deterministic ordering among them. Current tests cover two-way chain merges and a single ordering case, but there's no explicit test for ≥3 simultaneous same-level contacts resolving deterministically, no dedicated "Coconut contact does not award a merge score" test, and no explicit "unsettled fruit above the danger line does not end the game" regression test (the fix for the "instant game over on first drop" bug reported during manual playtesting) — the closest existing test checks geometry but not the `settled: false` gate directly.
- **Fix**: Add the three missing test cases to lock down behavior that was previously bug-fixed based on manual feedback, so regressions are caught automatically going forward.
- **Decision**: SKIPPED — user chose not to fix now.

### F8 — Fruit Rush's view-lifecycle pattern diverges from Memory Cards without explanation

- **Severity**: ⚪️ OBSERVATION
- **Dimension**: Pattern Consistency
- **Location**: `src/components/game/FruitRushGame.astro:230-242` vs `src/components/game/MemoryGame.astro` (view-opened handler)
- **Detail**: This is the pattern-consistency angle of F2: Memory Cards resets to a fresh game every time its view is opened; Fruit Rush does not. Even if resume-on-reopen is intentionally kept (Fix B in F2), it's worth documenting the divergence in the plan or a code comment so a future contributor doesn't assume both games follow the same lifecycle contract.
- **Fix**: Resolved together with F2 — if Fix A is chosen there, this observation disappears; if Fix B is chosen, add a one-line comment/plan note explaining the intentional divergence.
- **Decision**: RESOLVED — F2 was fixed via Fix A (reset on reopen), so Fruit Rush's lifecycle now matches Memory Cards; no further action needed.
