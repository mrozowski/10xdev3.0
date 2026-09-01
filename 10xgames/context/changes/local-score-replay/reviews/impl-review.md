<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Local Score Naming and Highlight on Replay Implementation Plan

- **Plan**: context/changes/local-score-replay/plan.md
- **Scope**: Phase 1 of 2, Phase 2 of 2 (full plan)
- **Date**: 2026-09-01
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Highlight can land on the wrong row if the new score falls outside the top 10

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/game/MemoryGame.astro:191-202
- **Detail**: `newEntryDate` is computed by scanning `addScore()`'s returned (already-truncated-to-10) list for the lexicographically-latest `date`, on the assumption that's always the entry just saved. If the just-saved score doesn't make the top 10 (e.g. player already has 10 higher scores saved), `addScore()`'s truncation drops it, and the reduce falls back to whatever entry currently holds the latest date — an older, unrelated entry gets flagged `newly-saved` and flashes instead of nothing flashing. Saved data itself is correct (this only affects which row is highlighted); `scores.ts` is out of plan scope so this needs a caller-side fix.
- **Fix**: Capture the previous list's latest date via `getScores()` immediately before calling `addScore()`; after the call, only set `newEntryDate` if the new latest date differs from that captured "before" value, otherwise dispatch `undefined` (no highlight). This stays entirely inside `MemoryGame.astro` and needs no `scores.ts` changes.
  - Strength: Correctly handles the truncation edge case with a small, local diff; keeps the "no scores.ts changes" scope guardrail intact.
  - Tradeoff: One extra `getScores()` read per save (negligible — same synchronous localStorage read pattern already used elsewhere).
  - Confidence: HIGH — the truncation behavior is fully covered by existing `scores.test.ts` cases, so the "before" vs "after" comparison is straightforward to reason about.
  - Blind spot: Assumes no two saves can happen within the same event-loop tick (true here — saves only fire from a single click handler).
- **Decision**: FIXED — captured previous latest date via `getScores()` before `addScore()`; `newEntryDate` is only set when it changed. Verified with `npm run test` (53 passed) and `npm run astro -- check` (0 errors).

### F2 — Flash-animation CSS correctly scoped as `:global()`

- **Severity**: ⚪ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/pages/index.astro:268-281
- **Detail**: `.score-entry.newly-saved` and its `@keyframes` are placed inside the existing `<style is:global>` block, consistent with `context/foundation/lessons.md`'s recorded rule that JS-created `.score-entry` nodes require global (not scoped) CSS to be styled.
- **Fix**: No action needed — noted for completeness.
- **Decision**: SKIPPED — no action required, confirmed compliant.
