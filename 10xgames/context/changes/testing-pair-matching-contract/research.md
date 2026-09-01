---
date: 2026-09-01T21:25:14+00:00
researcher: Copilot
git_commit: 0722f8b
branch: master
repository: mrozowski/10xdev3.0
topic: "Risk 5 - Memory Cards accepts matching and non-matching pairs incorrectly, preventing a player from completing a round as intended."
tags: [research, codebase, memory-cards, game-engine, pair-matching, vitest]
status: complete
last_updated: 2026-09-01
last_updated_by: Copilot
---

# Research: Risk 5 - Memory Cards accepts matching and non-matching pairs incorrectly, preventing a player from completing a round as intended.

**Date**: 2026-09-01T21:25:14+00:00
**Researcher**: Copilot
**Git Commit**: 0722f8b
**Branch**: master
**Repository**: mrozowski/10xdev3.0

## Research Question

Risk 5 - Memory Cards accepts matching and non-matching pairs incorrectly,
preventing a player from completing a round as intended.

## Summary

Pair evaluation is isolated in the pure game engine, so a unit-only test layer
is the cheapest source of meaningful regression signal. `flipCard()` compares
the two selected cards by `symbolId`, records a match or mismatch, and emits
the resulting state-transition event. `resolveMismatch()` returns mismatched
cards to a playable state after the UI cooldown.

The existing engine suite already verifies ordinary matching, mismatch scoring,
and round completion. The remaining useful Risk 5 coverage is narrowly
focused on guards and recovery: clicking a matched card again, clicking while a
mismatch is pending, and completing a new valid match after resolving a
mismatch. No component, browser, storage, or DOM integration test is needed
for this risk.

## Detailed Findings

### Pair identity and state transitions

- The engine's `Card` and `GameState` model tracks `symbolId`, `isFlipped`,
  `isMatched`, selected indices, game status, pair count, combo, and score in
  [`src/lib/memory-game/engine.ts:1-36`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L1-L36).
- Initial-state creation duplicates each selected symbol exactly twice. A
  card's shuffled `id` identifies its board position; `symbolId` is the pair
  identity used when evaluating a selection
  ([`engine.ts:89-133`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L89-L133)).
- `flipCard()` only accepts input while the game is `playing` and rejects
  cards that are already flipped or matched
  ([`engine.ts:228-250`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L228-L250)).
- On the second selection, equal `symbolId` values mark both cards as matched,
  increment the pair count and combo, award points, and transition to either
  `round_complete` or `completed` when all pairs are found
  ([`engine.ts:255-303`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L255-L303)).
- A non-matching second card applies the mismatch penalty, clears the combo,
  preserves both face-up cards, and moves the game into `checking`
  ([`engine.ts:306-318`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L306-L318)).
- `resolveMismatch()` is deliberately gated to exactly two selected cards in
  `checking`; it flips them down, clears the selected indices, and restores
  `playing` ([`engine.ts:327-342`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L327-L342)).

### UI boundary

- The interactive island delegates a card click to `flipCard()` and only
  schedules mismatch resolution after the engine emits a `mismatch` event
  ([`src/components/game/MemoryGame.astro:391-438`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/components/game/MemoryGame.astro#L391-L438)).
- Rendering treats either `isFlipped` or `isMatched` as face-up and disables
  matched controls ([`MemoryGame.astro:440-454`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/components/game/MemoryGame.astro#L440-L454)).
- The UI does not own pair identity or match decisions. Testing the engine
  directly avoids duplicating its state-machine assertions through a slower,
  more brittle DOM test.

### Existing test coverage and focused gaps

- Vitest is configured for `src/**/*.test.ts` in a jsdom environment
  ([`vitest.config.ts:4-9`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/vitest.config.ts#L4-L9)); the test command is `npm test`
  ([`package.json:13-14`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/package.json#L13-L14)).
- `engine.test.ts` provides a deterministic two-pair playing-state fixture and
  already covers a normal match, ordinary mismatch, zero-floor penalty, and
  round-completion variants
  ([`src/lib/memory-game/engine.test.ts:193-316`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.test.ts#L193-L316)).
- Mismatch resolution itself is covered, including its no-op behavior outside
  `checking` ([`engine.test.ts:320-350`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.test.ts#L320-L350)).
- The suite does not directly prove that a matched card cannot be selected
  again, that a third click during `checking` cannot alter the pending pair,
  or that mismatch resolution restores a board from which a subsequent valid
  match can proceed. These are the highest-value remaining unit assertions
  for Risk 5.

## Code References

- [`src/lib/memory-game/engine.ts:228-321`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L228-L321) - `flipCard()` input guards and match/mismatch transitions.
- [`src/lib/memory-game/engine.ts:327-342`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.ts#L327-L342) - mismatch recovery contract.
- [`src/lib/memory-game/engine.test.ts:193-350`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/lib/memory-game/engine.test.ts#L193-L350) - existing deterministic state fixture and mechanics coverage.
- [`src/components/game/MemoryGame.astro:391-454`](https://github.com/mrozowski/10xdev3.0/blob/0722f8b/src/components/game/MemoryGame.astro#L391-L454) - island's engine delegation and state rendering.

## Architecture Insights

The project keeps deterministic gameplay rules in `src/lib/memory-game/engine.ts`
and lets `MemoryGame.astro` orchestrate timers, delayed mismatch recovery, and
rendering. This separation gives pair matching a direct state-in/state-out
test seam. The unit tests should assert observable state transitions and
events, using explicit card fixtures rather than reproducing shuffle behavior
or production scoring calculations in their expected values.

For this risk, a unit test should prove one discrete behavior per case:
matched-card re-click is a no-op; `checking` does not accept a third flip; and
resolving a mismatch returns the same two cards to face-down, playable state
before a later matching selection. Keep score and final-round calculations in
their existing focused tests rather than expanding this change into a general
engine suite rewrite.

## Historical Context (from prior changes)

- `context/changes/first-memory-round/research.md:1-8` records that the
  engine owns pair verification, scoring, and game-state transitions.
- `context/changes/first-memory-round/plan.md` specifies complete engine
  coverage for pair matching and score calculations; the current test suite
  implements the core of that intent.
- `context/changes/progressive-memory-rounds/research.md:1-24` and
  `context/changes/progressive-memory-rounds/plan.md:22-27` preserve the
  decision that round-progression and gameplay state belong in `engine.ts` and
  are fully unit-tested.
- Commits `7682b09`, `968a7ae`, `5222b32`, and `adad4e0` introduced the
  progression engine, expanded symbol data, tracked score rounds, and
  integrated the game UI, respectively.

## Related Research

- `context/changes/first-memory-round/research.md`
- `context/changes/progressive-memory-rounds/research.md`

## Open Questions

- The current implementation's match/mismatch core is already covered. During
  planning, confirm whether the three identified guard/recovery cases provide
  sufficient regression signal, rather than adding redundant happy-path tests.
