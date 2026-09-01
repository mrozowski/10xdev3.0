# Pair-Matching Unit-Test Contract Implementation Plan

## Overview

Add three focused unit tests that protect Memory Cards from accepting invalid
pair-selection transitions. The tests extend the existing pure engine suite and
cover only Risk #5 from `context/foundation/test-plan.md`.

## Current State Analysis

`flipCard()` owns the pure pair-selection state machine: it rejects non-playing
input and cards already flipped or matched, identifies a pair by `symbolId`,
and enters `checking` after a mismatch. `resolveMismatch()` restores that pair
to playable state. The existing tests cover normal matches, mismatches,
penalties, and completion but do not cover the three selected guard and
recovery transitions.

## Desired End State

The unit suite proves that a completed pair cannot be selected again, pending
mismatch resolution cannot be disrupted by a third click, and a resolved
mismatch allows a subsequent valid match. No production behavior changes.

### Key Discoveries

- `flipCard()` rejects matched cards and all input outside the `playing` state
  in `src/lib/memory-game/engine.ts:228-236`.
- A mismatch enters `checking`; `resolveMismatch()` restores `playing`, clears
  selected indices, and turns the pair face-down in
  `src/lib/memory-game/engine.ts:306-342`.
- `src/lib/memory-game/engine.test.ts:193-350` already provides a
  deterministic two-pair fixture and mechanics-focused test conventions.

## What We're NOT Doing

- Changing game-engine, component, storage, timer, score, or layout behavior.
- Adding component, DOM, browser, integration, or end-to-end tests.
- Repeating existing happy-path match, mismatch-scoring, or completion tests.
- Expanding this change into a general engine-coverage audit.

## Implementation Approach

Extend the current `flipCard & matching mechanics` tests with one focused test
per selected state transition. Reuse the deterministic two-pair playing-state
fixture and assert observable events and resulting game state, rather than
mirroring production matching or scoring calculations. For the recovery test,
produce a mismatch through `flipCard()`, resolve it through
`resolveMismatch()`, then make a valid pair selection to prove the engine is
playable again.

## Critical Implementation Details

`flipCard()` intentionally returns the original state object without an event
when input is invalid. The two guard tests must assert this identity-preserving
no-op behavior so a later implementation cannot mutate pending or matched
state while appearing to reject the click.

## Phase 1: Pair-Matching Regression Contract

### Overview

Add the three selected unit-only state-transition tests to the existing engine
test suite.

### Changes Required

#### 1. Memory-game engine tests

**File**: `src/lib/memory-game/engine.test.ts`

**Intent**: Protect the pair-matching state machine from invalid follow-up
clicks and prove that mismatch recovery restores a usable board.

**Contract**:

- After a pair has matched, selecting either matched card returns the same
  state without an event and does not alter score, pair count, or selection.
- After a mismatch has moved the state to `checking`, selecting a third card
  returns the same pending state without an event or card mutation.
- After `resolveMismatch()` restores `playing`, selecting both cards of a
  valid remaining pair emits `match` and updates the pair state normally.
- Reuse `getPlayingState()` and the existing `flipCard()` /
  `resolveMismatch()` public API. Do not modify production code or introduce
  DOM fixtures.

### Success Criteria

#### Automated Verification

- `npm test -- src/lib/memory-game/engine.test.ts` passes with the three new
  focused tests.
- `npm run astro -- check` passes.
- `npm run build` passes.

#### Manual Verification

- Review the test descriptions and assertions to confirm they cover only the
  selected matched-card, pending-mismatch, and recovery scenarios.
- Confirm no component or integration test was added for Risk #5.

**Implementation Note**: After completing this phase and all automated
verification passes, pause here for manual confirmation from the human that
the manual testing was successful before proceeding. Phase blocks use plain
bullets; the corresponding `- [ ]` checkboxes for these items live in the
`## Progress` section at the bottom of the plan.

## Testing Strategy

### Unit Tests

- Matched-card re-click is an identity-preserving no-op.
- A third selection during `checking` is an identity-preserving no-op.
- A valid match succeeds after mismatch recovery has reset the board.

### Integration Tests

- None. Pair identity and state transitions are fully owned by the pure engine;
  an integration test would duplicate slower, more brittle coverage.

### Manual Testing Steps

1. Inspect the new tests to confirm every expected state follows the game
   rules, not copied implementation arithmetic.
2. Confirm their fixture uses explicit `symbolId` pairs and does not depend on
   shuffle order.
3. Confirm production source files and UI files remain unchanged.

## Performance Considerations

The change executes only in the existing Vitest suite and has no runtime or
bundle-size effect.

## Migration Notes

No migration, persisted-data update, or rollback procedure is required because
the change adds tests only.

## References

- Research: `context/changes/testing-pair-matching-contract/research.md`
- Test-plan Risk #5: `context/foundation/test-plan.md`
- Engine state machine: `src/lib/memory-game/engine.ts:228-342`
- Existing engine fixture and coverage: `src/lib/memory-game/engine.test.ts:193-350`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Pair-Matching Regression Contract

#### Automated

- [x] 1.1 Add the three focused pair-matching state-transition unit tests
- [x] 1.2 Run the focused engine unit suite
- [x] 1.3 Run Astro type checking and production build

#### Manual

- [x] 1.4 Confirm the tests remain unit-only and cover the selected scenarios
