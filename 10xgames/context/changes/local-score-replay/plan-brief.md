# Local Score Naming and Highlight on Replay — Plan Brief

> Full plan: `context/changes/local-score-replay/plan.md`

## What & Why

Add the missing piece of US-02/FR-007: an optional local-name field for a completed-round score, so players can name their save instead of it always defaulting to "Anonymous" with no way to influence it. The save moves from "instant, on round-end" to "on player confirmation" via the existing modal button, and the new entry flashes in the TOP SCORES list for visible confirmation.

## Starting Point

`MemoryGame.astro` already auto-saves every completed/timed-out round via `addScore()` (from the `local-score-contract` foundation) under "Anonymous", and "PLAY AGAIN" already restarts a fresh game. `index.astro` already renders a TOP SCORES list that re-renders on a `memory-game:scores-updated` event. No catalogue/game-list page exists yet — that's a separate, still-proposed slice (S-05).

## Desired End State

After winning or timing out, the player sees a modal with a name field (blank/placeholder "Anonymous"). Clicking the single action button saves the score under the entered name (or "Anonymous" if blank) and immediately starts a new game. The TOP SCORES list briefly highlights the entry that was just saved.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Naming UX | Name field directly in the existing victory/game-over modal | Reuses the existing modal instead of adding a new screen/step. |
| Save timing | Defer `addScore()` until the modal's single action button is clicked | Lets the player's name choice determine what gets saved, rather than saving before they can type it. |
| Blank name | Falls back to "Anonymous" (matches `scores.ts`'s existing trim/fallback logic) | No new logic needed — the foundation contract already does this. |
| "Return to game list" | Scoped out this round; today's single-page layout stands in until S-05 ships | No catalogue page exists yet; blocking on S-05 would stall this slice unnecessarily. |
| Save confirmation | Briefly flash/highlight the newly saved entry in TOP SCORES | Gives the player visible proof their save landed. |

## Scope

**In scope:**
- Name input added to the victory/game-over modal only (not the intermediate round-complete modal).
- Deferred `addScore()` call fired from the modal's action button.
- Highlight animation for the newly saved entry in the TOP SCORES list.

**Out of scope:**
- Any changes to `src/lib/scores.ts` or `src/lib/preferences.ts`.
- Catalogue/"return to game list" navigation (S-05).
- Renaming/editing previously saved scores.
- New automated component tests (consistent with existing repo convention — only `src/lib/*.ts` is unit-tested).

## Architecture / Approach

All changes are contained to two existing files: `src/components/game/MemoryGame.astro` (modal markup + deferred-save logic) and `src/pages/index.astro` (highlight rendering). The new entry is identified for highlighting by finding the lexicographically-latest ISO `date` in `addScore`'s returned list — no changes to the `scores.ts` contract needed.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Modal naming & deferred save | Name input, deferred `addScore()`, enriched `scores-updated` event | Getting show/hide of the name row right across all three modal states (victory/game-over/round-complete) |
| 2. High-score highlight on save | Flash animation on the newly saved TOP SCORES entry | Must stay in the `is:global` style block since list items are JS-created (existing repo convention) |

**Prerequisites:** `local-score-contract` (F-01) and `first-memory-round` (S-01), both already done.
**Estimated effort:** ~1 short session across 2 phases.

## Open Risks & Assumptions

- Assumes only one score save can happen at a time (no concurrent saves), so "latest ISO date in the returned list" reliably identifies the new entry.
- Assumes the single-page layout is an acceptable stand-in for "return to game list" until S-05 ships — flagged explicitly rather than silently dropped.

## Success Criteria (Summary)

- Player can type an optional name in the victory/game-over modal before it saves; blank defaults to "Anonymous".
- The saved score appears correctly in the TOP SCORES list and visibly flashes once.
- No regressions to existing round-complete flow, replay, or the full `npm run test` suite.
