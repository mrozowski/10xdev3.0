<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Local Score Stats CRUD Implementation Plan

- **Plan**: context/changes/local-score-stats-crud/plan.md
- **Scope**: Full plan (3 of 3 phases)
- **Date**: 2026-09-02
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Hidden game sessions can inflate Memory Cards statistics

- **Severity**: WARNING
- **Impact**: MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: src/components/game/MemoryGame.astro:336-375, 438-450
- **Detail**: The game starts in the island constructor while the catalogue view is hidden. Closing the game flushes time but leaves `gameViewOpenedAt` non-null, so reopening skips `recordGameOpened()` and a later flush includes catalogue time. The active hidden round timer can also reach `time_up` and record a completed session before the player launches the game. This violates the planned requirement to accumulate Memory Cards time only while the game view is open and to count final outcomes only for an active session.
- **Fix**: On view close, flush and clear the game-view timestamp, then ensure hidden gameplay cannot complete or record statistics until the view is opened again.
- **Decision**: FIXED — active-view lifecycle guard

### F2 — Clearing statistics does not persist after a platform-time flush

- **Severity**: WARNING
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/pages/index.astro:43-64, src/components/game/MemoryGame.astro:324-333
- **Detail**: Clearing stats only resets the game view's timestamp. The page-level `lastPlatformFlush` remains unchanged, so returning to the catalogue or unloading the page writes the elapsed pre-clear platform time back into the cleared statistics.
- **Fix**: Notify the page-level platform timer when stats are cleared and reset its baseline before the next flush.
- **Decision**: FIXED — reset platform timer on stats clear

### F3 — Browser test does not protect score/stat independence across navigation

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/local-score-stats-crud.spec.ts:44-58
- **Detail**: The new browser flow deletes its only score before clearing stats and asserts the stats state only immediately after the clear. It cannot catch the platform timer repopulating stats after navigation and does not prove clearing stats leaves a score intact.
- **Fix**: Retain the saved score, clear stats, trigger a platform-time flush, and assert that the score remains while stats stay cleared.
- **Decision**: SKIPPED
