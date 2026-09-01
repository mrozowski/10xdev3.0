# Local Score Naming and Highlight on Replay Implementation Plan

## Overview

We're adding the missing piece of US-02/FR-007: letting the player optionally name their completed-round score before it's saved locally, instead of always auto-saving as "Anonymous". The save moves from "the instant the round ends" to "when the player confirms via the modal's single action button", and the newly saved entry is briefly highlighted in the TOP SCORES list so the player sees their save land. "Return to the game list" is explicitly scoped out this round — no catalogue page exists yet (S-05 `game-catalogue-launcher` is a separate, still-`proposed` slice); today's single-page layout (game + TOP SCORES list on one page) already satisfies the underlying need until S-05 ships.

## Current State Analysis

- `src/components/game/MemoryGame.astro` calls `addScore({ score, roundsCompleted })` immediately inside `handleCardClick`'s `'completed'` branch and inside `startRoundTimer`'s `time_up` branch — before the victory/game-over modal is even shown. There is no name input anywhere; every score saves as `"Anonymous"` (`scores.ts`'s existing fallback).
- The same modal (`#game-modal`) is reused for three distinct outcomes via `nextAction: 'advance' | 'restart'`: `showRoundCompleteModal()` (mid-game, `nextAction = 'advance'`, no score saved — correct, the round isn't over), `showVictoryModal()` and `showGameOverModal()` (game truly over, `nextAction = 'restart'`, score already saved by the time the modal appears).
- The single `#btn-play-again` button's click handler just hides the modal and calls `advanceToNextRound()` or `startNewGame()` based on `nextAction` — it does no save-related work today.
- `src/lib/scores.ts`'s `addScore(entry: NewScoreEntry): ScoreEntry[]` already trims and falls back an empty/whitespace `name` to `"Anonymous"` — this exactly matches the desired blank-name behavior, no changes needed to `scores.ts`.
- `src/pages/index.astro` renders the TOP SCORES list from `getScores()` on `memory-game:scores-updated` and on initial load; list items are created via `document.createElement`, so any styling reaching them must stay in the `is:global` style block per the existing repo convention (`context/foundation/lessons.md`: "Use :global() for CSS Reaching Outside Component Scope").
- No component-level tests exist for `MemoryGame.astro` or `index.astro`'s inline scripts (only `src/lib/*.ts` modules have Vitest coverage) — this change follows that existing convention; verification is manual + `npm run astro -- check` + the existing `npm run test` suite for regressions.

## Desired End State

- After a round ends in victory or a timeout (not after an intermediate round), the modal shows a name input (`placeholder="Anonymous"`) alongside the existing stats. The score is **not** saved until the player clicks the modal's single action button.
- Clicking that button saves the score under the entered name (or `"Anonymous"` if left blank), then immediately restarts a new game (round 1) — matching the current "PLAY AGAIN" restart behavior, just with the save now happening on click instead of on round-end.
- The intermediate "ROUND N COMPLETE!" modal (`nextAction = 'advance'`) is unchanged: no name input, no save, "NEXT ROUND" still just advances.
- The TOP SCORES list on `index.astro` briefly highlights (flashes) the entry that was just saved, so the player gets visual confirmation their save landed.

**Verification**: `npm run test` passes (existing suite, no regressions), `npm run astro -- check` reports no new type errors, and manual browser testing confirms the name input appears only on victory/game-over, blank names save as "Anonymous", entered names save correctly, and the new entry flashes in the TOP SCORES list.

### Key Discoveries:

- `addScore`'s existing blank-name fallback (`entry.name?.trim() || 'Anonymous'` in `src/lib/scores.ts`) already implements the exact behavior confirmed with the user — no `scores.ts` changes needed, only the caller-side timing changes.
- `addScore`'s return value (`ScoreEntry[]`) is currently ignored by both call sites in `MemoryGame.astro` — nothing else in the codebase depends on augmenting it, so identifying "the entry that was just saved" for highlighting purposes can be done entirely in the caller (find the entry with the lexicographically-latest ISO `date` in the returned array — ISO 8601 strings sort chronologically) without changing `scores.ts`'s contract or its existing tests.
- `round_complete` never called `addScore` before this change and still shouldn't — scoring only finalizes when the game truly ends (full victory or timeout), matching `TOTAL_ROUNDS` completion or `time_up`.

## What We're NOT Doing

- No changes to `src/lib/scores.ts` or `src/lib/preferences.ts` — the existing `addScore` contract (schema, top-10 retention, blank-name fallback) already covers this change's needs.
- No "return to game list" navigation or catalogue UI — out of scope until S-05 (`game-catalogue-launcher`) ships; today's single-page layout is treated as satisfying this need for now.
- No rename/edit of already-saved past scores — naming only applies at the moment a new score is saved.
- No keyboard-submit-on-Enter or additional input affordances beyond a standard text input — not required by the confirmed UX and left as a natural follow-up if desired later.
- No new automated component tests for `MemoryGame.astro`/`index.astro` — consistent with the existing repo convention of only unit-testing `src/lib/*.ts` modules; this UI change is verified manually plus type-checking.

## Implementation Approach

Defer the two existing `addScore(...)` call sites into a single deferred save that fires from `#btn-play-again`'s click handler, gated on `nextAction === 'restart'`. Store the score/roundsCompleted to save in a new `pendingScore` field set at the moment the victory/game-over modal is shown (replacing the immediate `addScore` calls). Add a name input to the modal template, shown/cleared only for victory/game-over, hidden for the mid-game round-complete state. After saving, dispatch the existing `memory-game:scores-updated` event with the new entry's `date` in `detail` so `index.astro` can identify and flash the matching list item — a purely additive, backward-compatible use of `CustomEvent.detail` (no other listener depends on `Event` vs `CustomEvent`).

## Phase 1: Modal naming & deferred save

### Overview

Add the name input to the victory/game-over modal, defer `addScore()` from round-end to button-click, and enrich the `scores-updated` event with the new entry's identity.

### Changes Required:

#### 1. Modal markup and name input

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Add a labeled text input (`placeholder="Anonymous"`) inside `.modal-body`, positioned between the stats block and `.modal-actions`, wrapped in a container (e.g. `#name-entry-row`) that can be shown/hidden independently of the rest of the modal.

**Contract**: New elements `#name-entry-row` (container, toggled via the existing `.hidden` utility class already used elsewhere in this file) and `#score-name-input` (a `type="text"` input with `maxlength` and `placeholder="Anonymous"`). No `<form>` wrapper — the input is read directly via its `.value` on button click.

#### 2. Deferred save state and modal show/hide logic

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Replace the two immediate `addScore(...)` calls (in the `time_up` branch of `startRoundTimer` and the `'completed'` branch of `handleCardClick`) with setting a new `pendingScore` field, then perform the actual save inside the `#btn-play-again` click handler only when `nextAction === 'restart'` and `pendingScore` is set. `showVictoryModal()` and `showGameOverModal()` must clear the name input's value and reveal `#name-entry-row`; `showRoundCompleteModal()` must hide `#name-entry-row` (no save happens for that path, unchanged from today).

**Contract**: New private field `pendingScore: { score: number; roundsCompleted: number } | null`, initialized `null` and reset to `null` immediately after the deferred save runs. The click handler's save branch: read and trim `#score-name-input`'s value, call `addScore({ name, score: pendingScore.score, roundsCompleted: pendingScore.roundsCompleted })` (empty string is valid input — `scores.ts` already falls back to `"Anonymous"`), then dispatch `memory-game:scores-updated` with `detail: { newEntryDate }` where `newEntryDate` is the `date` of the entry in the returned list with the lexicographically-latest ISO date string.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes (full existing suite, no regressions)
- `npm run astro -- check` reports no new type errors

#### Manual Verification:

- Completing a round (win or timeout) shows the modal with a visible, empty name input (placeholder "Anonymous") and the score is NOT yet in `localStorage`'s score list until the button is clicked
- Clicking the button with a name typed in saves that exact name; clicking with the field left blank saves "Anonymous"
- Advancing via the intermediate "ROUND N COMPLETE!" modal shows no name input and does not save a score
- Clicking the action button after victory/game-over both saves the score and restarts a fresh round 1

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: High-score highlight on save

### Overview

Visually confirm the save by briefly flashing the newly added entry in the TOP SCORES list.

### Changes Required:

#### 1. Highlight the newly saved entry

**File**: `src/pages/index.astro`

**Intent**: Read the `newEntryDate` carried on the `memory-game:scores-updated` event's `detail` and mark the matching rendered `<li>` so it visibly flashes once, then let the existing re-render-on-next-event naturally clear the highlight (no manual cleanup timer needed since the list is fully rebuilt on every `scores-updated` event).

**Contract**: `renderHighScores` accepts an optional `highlightDate?: string` parameter; when building each `.score-entry` `<li>`, if `entry.date === highlightDate`, add an additional CSS class (e.g. `newly-saved`). The `memory-game:scores-updated` listener reads `(event as CustomEvent<{ newEntryDate?: string }>).detail?.newEntryDate` and passes it through; the initial page-load render call passes no highlight date.

#### 2. Flash animation styling

**File**: `src/pages/index.astro`

**Intent**: Add a one-shot CSS flash animation for `.score-entry.newly-saved` in the existing `is:global` style block (per the repo's documented convention that JS-created elements need global, not scoped, styles).

**Contract**: A `@keyframes` rule transitioning background/box-shadow from a highlighted state back to the existing entry styling, applied via `.score-entry.newly-saved { animation: ...; }`, added inside the existing `<style is:global>` block alongside `#high-scores-list .score-entry` and friends.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes (full existing suite, no regressions)
- `npm run astro -- check` reports no new type errors

#### Manual Verification:

- After saving a score (named or blank), the corresponding row in the TOP SCORES list visibly flashes/highlights once and then settles back to normal styling
- Saving a second score highlights only the new entry, not previously-saved ones
- Initial page load (no save yet) shows no highlighted rows

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- Not applicable for this change — `MemoryGame.astro` and `index.astro`'s inline scripts have no existing unit test harness (only `src/lib/*.ts` modules are Vitest-covered), consistent with the current repo convention. `npm run test` is run to confirm no regressions in the existing `src/lib/*.test.ts` suite.

### Integration Tests:

- Not applicable — no test runner exercises the Astro component/script layer in this repo.

### Manual Testing Steps:

1. Play a round to victory (complete all rounds) — confirm the modal shows an empty name input, type a name, click the button, confirm the TOP SCORES list shows that name and the row flashes.
2. Play a round to timeout — confirm the same modal/name/save/highlight behavior on the game-over path.
3. Leave the name input blank and save — confirm the entry saves as "Anonymous".
4. Complete an intermediate round (not the final one) — confirm no name input appears and no new score is saved until the game truly ends.
5. Save two scores in a row — confirm only the most recently saved entry is highlighted after the second save.
6. Reload the page — confirm the TOP SCORES list renders with no highlighted rows.

## Performance Considerations

No new persistent state, timers, or network calls — this is a small DOM/event change on top of existing synchronous `localStorage` operations already covered by `local-score-contract`'s performance analysis.

## Migration Notes

Not applicable — no stored data shape changes; `scores.ts`'s existing `ScoreEntry`/`NewScoreEntry` types are unchanged.

## References

- Roadmap: `context/foundation/roadmap.md` (S-02: local-score-replay)
- PRD: `context/foundation/prd.md` (FR-004, FR-007, US-02)
- Change identity: `context/changes/local-score-replay/change.md`
- Foundation contract this builds on: `context/changes/local-score-contract/plan.md` (`addScore`, `scores.ts`)
- First playable round this builds on: `context/changes/first-memory-round/plan.md` (modal, `MemoryGame.astro` structure)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Modal naming & deferred save

#### Automated

- [x] 1.1 npm run test passes (full existing suite, no regressions) — 38e69f9
- [x] 1.2 npm run astro -- check reports no new type errors — 38e69f9

#### Manual

- [x] 1.3 Modal shows empty name input on victory/game-over; score not saved until button click — 38e69f9
- [x] 1.4 Named save and blank-name (Anonymous) save both work correctly — 38e69f9
- [x] 1.5 Intermediate round-complete modal shows no name input and does not save — 38e69f9
- [x] 1.6 Action button saves and restarts a fresh round 1 after victory/game-over — 38e69f9

### Phase 2: High-score highlight on save

#### Automated

- [x] 2.1 npm run test passes (full existing suite, no regressions) — 1aa24cd
- [x] 2.2 npm run astro -- check reports no new type errors — 1aa24cd

#### Manual

- [x] 2.3 Newly saved entry visibly flashes once in the TOP SCORES list — 1aa24cd
- [x] 2.4 Only the most recently saved entry highlights, not prior ones — 1aa24cd
- [x] 2.5 Initial page load shows no highlighted rows — 1aa24cd
