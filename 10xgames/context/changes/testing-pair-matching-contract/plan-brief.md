# Pair-Matching Unit-Test Contract — Plan Brief

> Full plan: `context/changes/testing-pair-matching-contract/plan.md`
> Research: `context/changes/testing-pair-matching-contract/research.md`

## What & Why

This change adds unit-only regression protection for the Memory Cards
pair-matching state machine. It protects the ways a player could become unable
to complete a round when invalid follow-up selections mutate engine state.

## Starting Point

The pure engine already covers normal matching, mismatch penalties, and
completion. Its deterministic two-pair fixture does not yet test a matched-card
re-click, a third click while mismatch resolution is pending, or recovery into
a later valid match.

## Desired End State

The Vitest engine suite proves each selected transition independently. Gameplay
code and the Astro island remain unchanged, and no integration test duplicates
the pure engine's responsibility.

## Key Decisions Made

| Decision | Choice | Why | Source |
|---|---|---|---|
| Test layer | Unit tests only | `flipCard()` and `resolveMismatch()` are pure state transitions, so DOM coverage adds no cheaper signal. | Research |
| Test cases | Matched re-click, pending-mismatch third click, recovery then match | These are the three uncovered Risk #5 guards and recovery behaviors. | Plan |
| Test structure | Three focused tests | Isolated failures identify the broken state-machine contract directly. | Plan |
| Production scope | No code changes | Existing logic already implements the intended transitions; the gap is regression protection. | Research |

## Scope

**In scope:**

- Add three focused tests in `src/lib/memory-game/engine.test.ts`.
- Run the engine suite, Astro check, and production build.

**Out of scope:**

- Engine, UI, storage, timer, scoring, and layout changes.
- Integration, browser, or end-to-end test coverage.
- Broad engine test-suite expansion.

## Architecture / Approach

Tests call the existing public engine functions with the current deterministic
two-pair fixture. Guard cases assert identity-preserving no-ops; recovery
asserts the observable path from mismatch through reset to a valid match.

## Phases at a Glance

| Phase | What it delivers | Key risk |
|---|---|---|
| 1. Pair-Matching Regression Contract | Three unit tests for invalid-click guards and mismatch recovery | State corruption preventing a playable round |

**Prerequisites:** Existing Vitest configuration and engine fixture.
**Estimated effort:** One focused implementation session.

## Open Risks & Assumptions

- The plan assumes the current engine contract is intentional; it adds
  regression coverage rather than changing gameplay rules.
- Tests must derive expected behavior from the game rules and state contract,
  not replicate production scoring or matching implementation details.

## Success Criteria (Summary)

- The three selected pair-matching transitions pass in the focused unit suite.
- Astro type checking and the production build pass.
- The change remains unit-only with no production or UI-file edits.
