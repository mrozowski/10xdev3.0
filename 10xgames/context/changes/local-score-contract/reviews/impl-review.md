<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Local Score State and Configuration Contract Implementation Plan

- **Plan**: context/changes/local-score-contract/plan.md
- **Scope**: Phases 1-4 of 4
- **Date**: 2026-08-31
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 1 warning, 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | WARNING |

## Findings

### F1 — Corrupt score entries discard the whole leaderboard

- **Severity**: WARNING
- **Impact**: MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/scores.ts:39-40, 47
- **Detail**: `getScores()` returns an empty list when any one parsed entry is invalid because it uses `scores.every(isScoreEntry)`. A single corrupted local record therefore hides every otherwise-valid saved score. Although TypeScript callers cannot supply it, `addScore()` also accepts non-finite scores at runtime and persists them; that makes subsequent reads reject the full list.
- **Fix**: Validate the incoming score before adding it and filter invalid stored entries on read, retaining valid entries rather than discarding the leaderboard.
  - Strength: Preserves recoverable local player data and prevents a runtime caller from persisting a value the reader rejects.
  - Tradeoff: Requires an explicit policy for invalid input, such as rejecting it or returning the existing list.
  - Confidence: HIGH — the existing `isScoreEntry` guard already defines the valid persisted score shape.
  - Blind spot: The plan does not specify a recovery policy for partly corrupt score arrays.
- **Decision**: FIXED

### F2 — Roadmap still marks the completed foundation as in progress

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/foundation/roadmap.md:45,73
- **Detail**: The change record is `implemented` and all four plan phases are complete, but both the roadmap summary and the F-01 section retain `in-progress`. This leaves the dependency status for S-01 and S-02 inaccurate.
- **Fix**: Mark F-01 as `done` in both roadmap status locations.
- **Decision**: FIXED

### F3 — Development-only check tooling is installed as production dependencies

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: package.json:16-19
- **Detail**: `@astrojs/check` and `typescript` were added with the implementation but are listed in `dependencies`, despite the associated commit describing them as development dependencies. They are build and static-check tooling, so this classification unnecessarily expands the production dependency set.
- **Fix**: Move `@astrojs/check` and `typescript` to `devDependencies` and refresh the lockfile.
- **Decision**: FIXED

### F4 — Completed browser verification has no reviewable evidence

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: context/changes/local-score-contract/plan.md:270
- **Detail**: The Phase 4 manual console verification is checked complete, but its commit only adds the completion marker; it contains no scratch script, browser-test artifact, or recorded output showing persistence across reload or the throwing-`localStorage` scenario. The automated tests do cover storage exceptions, but they do not provide observable evidence for the reload check.
- **Fix**: Record concise manual verification evidence with the implementation or leave the manual criterion unchecked until that evidence is available.
- **Decision**: SKIPPED
