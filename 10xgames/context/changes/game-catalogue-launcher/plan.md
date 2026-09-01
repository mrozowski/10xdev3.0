# Game Catalogue Launcher Implementation Plan

## Overview

We are adding the 10x Games catalogue shell that lets a player choose Memory Cards from the home screen, open it, and return cleanly to the game list without touching the Memory Cards engine or score-naming logic in the game itself. This is a product-shell and navigation change, not a gameplay rewrite.

## Current State Analysis

The repository already contains the first playable Memory Cards island and local score contract:

- `src/pages/index.astro` renders a single page with one active game heading, the `MemoryGame` island, and a footer listing locally saved scores.
- `src/components/game/MemoryGame.astro` owns the gameplay loop, timer, preview reveal, and victory/game-over modal, and it dispatches `memory-game:scores-updated` when a score changes.
- `src/lib/scores.ts` stores a single local list of score entries under a namespaced key; it does not yet distinguish scores by game.
- There is no catalogue card, no launcher state, no separate list view, and no return-to-catalogue flow.
- `context/foundation/prd.md` explicitly requires the player to choose Memory Cards from an available game list (FR-002) and preserve a fast, private, no-backend play loop (FR-001, Non-Goals).
- The current user decision is to keep the Memory Cards gameplay and score naming work in a separate branch and avoid touching that branch's files; the launcher should only add a higher-level catalogue experience and inter-view navigation.

## Desired End State

After this change:

- The home screen presents a retro catalogue with a prominent Memory Cards tile/card that can be launched immediately.
- The first click or tap on Memory Cards swaps the page from the catalogue view to the in-game view without a full reload.
- A visible return control takes the player back to the catalogue after the current round or when the player chooses to exit.
- The top-score area reflects the catalogue’s per-game summary without changing the current game’s local scoring behavior or adding a naming requirement inside the memory game itself.
- The launcher remains responsive on phones, tablets, and desktops and keeps the initial page load lightweight by reusing the existing `MemoryGame` island instead of hydrating extra frameworks.

### Key Discoveries:

- `src/pages/index.astro` is already the app shell, so the catalogue view can be introduced as a view-state toggle without adding routing complexity.
- `window.dispatchEvent(new Event('memory-game:scores-updated'))` is a clean integration seam for top-score UI refreshes without editing the game logic.
- The current PRD-driven constraint is a “one game first” launch experience; the launcher should feel like an extensible shell for future games without overbuilding a multi-game catalogue in the first pass.

## What We're NOT Doing

- No behavioral edits inside `src/components/game/MemoryGame.astro` beyond what is required for a clean launch/return shell and any minimal view toggling hooks.
- No new player-name flow or score schema changes inside the Memory Cards logic; that is being handled on another branch.
- No backend, auth, or cloud-sync layer.
- No extra games beyond the Memory Cards catalogue entry in this phase.
- No full route-based app or multi-page architecture for future games; keep the MVP to a lightweight view switcher.

## Implementation Approach

Use a thin catalogue shell in `src/pages/index.astro` and a small launcher-style component for the game selection card. The existing `MemoryGame` island stays intact and is mounted only when the player chooses the Memory Cards entry. A simple view state (`catalogue` vs `game`) controls which section is visible; the catalogue can also display a top-score summary that is independent from the game’s own in-progress score logic. This matches the PRD’s “instant, private, single-game MVP” requirement and keeps future games simple to add without re-architecting the app.

## Critical Implementation Details

- The launcher should avoid mutating the Memory Game’s internal score storage contract or adding a prompt in the game for naming; that would create merge conflict risk with the parallel branch.
- The catalogue shell is presentation-level only: it may read a small summary of “best score for game” from local storage, but it should not rewrite the existing score record format used by the game implementation.
- The return action should preserve the single-page feel and avoid forcing an expensive reload; it must be keyboard-accessible and visible on small screens.

## Phase 1: Catalogue shell and view-state toggle

### Overview

Replace the current single-game page with a lifecycle that can show either the game catalogue or the active Memory Cards game, keeping the overall UI in one static page.

### Changes Required:

#### 1. Page-level launcher state

**File**: `src/pages/index.astro`

**Intent**: Convert the single active-game layout into a catalogue-and-game shell with explicit `catalogue` and `game` view states, while retaining the retro 10x Games brand styling and the existing `MemoryGame` island.

**Contract**: A `catalogue` screen with a Memory Cards card and a `game` screen that renders the current `MemoryGame` component; a return control sends the user back to the catalogue view. The page remains a static Astro route with no backend or router dependency.

#### 2. Launcher UI styling

**File**: `src/pages/index.astro`

**Intent**: Add catalogue card, return button, and responsive layout styles that keep the initial page lightweight and readable on desktop, tablet, and phone widths.

**Contract**: CSS classes and layout rules for a catalogue tile grid, game header, and a return action with responsive breakpoints; no large JS or dependency additions.

### Success Criteria:

#### Automated Verification:

- `npm run astro -- check` passes
- `npm run build` completes successfully

#### Manual Verification:

- Player can open the site and immediately see the catalogue view
- Clicking Memory Cards opens the game and the return control brings the player back to the catalogue
- Layout remains usable at mobile and desktop widths

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Per-game top-score summary contract

### Overview

Add the catalogue-level score summary without altering the game’s own score schema or naming logic, so the home screen can display the best result for Memory Cards without creating merge conflicts.

### Changes Required:

#### 1. Catalogue score contract

**File**: `src/lib/catalog.ts` (new file, or equivalent helper module)

**Intent**: Define a minimal, game-scoped summary model that reads the best locally stored score for the Memory Cards entry and exposes it to the catalogue UI without changing the underlying `scores.ts` storage contract used by the game.

**Contract**: A small helper that returns a `{ gameId, label, topScore, updatedAt }` summary for the launcher; any read/write logic remains browser-local and intentionally side-effect-free outside the catalogue shell.

#### 2. Catalogue score refresh integration

**File**: `src/pages/index.astro`

**Intent**: Wire the summary display to the same scoreboard refresh signal used by the game (`memory-game:scores-updated`) so the catalogue updates when a round completes.

**Contract**: A listener on the page or catalog shell that refreshes the Memory Cards tile score summary when the game dispatches a score update event, without editing game internals.

### Success Criteria:

#### Automated Verification:

- `npm run astro -- check` passes
- `npm run build` completes successfully

#### Manual Verification:

- Memory Cards card shows a score summary after a completed round
- The score summary updates on the next page refresh or when the game emits the event
- The game itself still behaves as before, without a new naming prompt or modified score flow

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Responsive catalogue polish and final verification

### Overview

Complete the final polish pass for the launcher—layout spacing, focus states, and the small interaction details needed to make the catalogue feel like a real launcher while staying lean.

### Changes Required:

#### 1. Final UX and accessibility pass

**File**: `src/pages/index.astro`

**Intent**: Ensure the catalogue entry and return controls are easy to find, keyboard-accessible, and consistent with the retro brand without overbuilding the interface.

**Contract**: Button semantics, focus outlines, spacing, and label text for the launcher action; no additional frameworks or backend dependencies.

#### 2. End-to-end smoke checks

**File**: `src/pages/index.astro` and related stylesheet blocks

**Intent**: Validate that the launcher works as a single-page shell with the Memory Cards island reused in one place.

**Contract**: Manual QA across desktop and at least one narrow mobile viewport, plus an Astro build check to confirm no rendering regressions.

### Success Criteria:

#### Automated Verification:

- `npm run astro -- check` passes
- `npm run build` completes successfully

#### Manual Verification:

- The site opens to the game catalogue and launches Memory Cards cleanly
- The return control returns reliably to the catalogue
- The layout remains readable and tap-friendly on a phone-sized viewport
- No regressions in the existing retro Memory Cards flow or local score persistence

---

## Testing Strategy

### Unit Tests:

- Add focused tests for the catalogue score summary helper if a separate helper module is introduced.
- Validate fallback behavior when no local score exists for a game.

### Integration Tests:

- Not a full browser matrix; this change is validated via Astro build plus manual smoke tests in desktop and mobile viewport sizes.

### Manual Testing Steps:

1. Run `npm run dev` and confirm the page loads into the catalogue view.
2. Click the Memory Cards card and confirm the game opens without a full page reload.
3. Complete a quick round or trigger a score update, then return to the catalogue.
4. Check that the top score summary updates correctly and the return control is visible and usable.
5. Resize to a phone-width viewport and confirm the catalogue and return flow still work.

## Performance Considerations

- Keep the catalogue implementation static and declarative; avoid heavy client-side libraries.
- Reuse the existing `MemoryGame` island instead of creating a second game instance or multiple hydration bundles.
- Use CSS-driven transitions and simple DOM toggling rather than introducing a component framework.

## References

- Product requirements: `context/foundation/prd.md`
- Deployment/stack choice: `context/foundation/tech-stack.md`
- Current game implementation: `src/components/game/MemoryGame.astro`
- Current app shell: `src/pages/index.astro`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Catalogue shell and view-state toggle

#### Automated

- [x] 1.1 `npm run astro -- check` passes
- [x] 1.2 `npm run build` completes successfully

#### Manual

- [ ] 1.3 Player can open the site and see the catalogue view
- [ ] 1.4 Clicking Memory Cards opens the game and return flow works

### Phase 2: Per-game top-score summary contract

#### Automated

- [ ] 2.1 `npm run astro -- check` passes
- [ ] 2.2 `npm run build` completes successfully

#### Manual

- [ ] 2.3 Memory Cards tile shows a valid score summary after a complete round
- [ ] 2.4 game score flow remains unchanged by the launcher

### Phase 3: Responsive catalogue polish and final verification

#### Automated

- [ ] 3.1 `npm run astro -- check` passes
- [ ] 3.2 `npm run build` completes successfully

#### Manual

- [ ] 3.3 catalogue and return flow remain usable on a phone-sized viewport
- [ ] 3.4 no regressions in the existing Memory Cards game flow
