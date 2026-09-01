# Game Catalogue Launcher — Plan Brief

> Full plan: `context/changes/game-catalogue-launcher/plan.md`

## What & Why

This plan adds the 10x Games launcher shell for the Memory Cards MVP: a retro catalogue view, a single Memory Cards tile, and a clean return-to-catalogue path after play. The goal is to match the PRD’s requirement that a player can choose a game from the site and start the experience instantly without backend infrastructure or account friction.

## Starting Point

The site currently renders a single Memory Cards game view directly from `src/pages/index.astro`, with the game loop and local score list already present in `src/components/game/MemoryGame.astro` and `src/lib/scores.ts`. There is no catalogue layer, no game selection state, and no return action for a completed round.

## Desired End State

A player opens the site and sees a retro catalogue with a Memory Cards card, launches it with one click or tap, plays the existing game, and returns to the catalogue without a full reload or a major change to the Memory Cards logic. The launcher also presents a compact top-score summary without changing the game’s score-naming flow.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Scope | Single catalogue card for Memory Cards | Keeps the MVP aligned with the roadmap and prevents unnecessary feature creep. | Plan |
| Return flow | Return to catalogue; keep game logic untouched | Avoids conflicts with the parallel Memory Cards branch while preserving the launcher model. | Plan |
| Score visibility | Catalogue-level top-score summary only | Meets the PRD’s game-selection experience without altering the game’s naming flow. | Plan |
| Architecture | Single-page state switcher in Astro | Keeps deployment static and lightweight while adding launcher behaviour. | Plan |
| Verification | Build + smoke tests on desktop and mobile viewports | Matches the small-MVP delivery standard without turning this into a full browser matrix. | Plan |

## Scope

**In scope:**
- Catalogue shell with a Memory Cards launch card
- Game selection and return-to-catalogue flow
- Single-page responsive layout and light retro styling
- Top-score summary for the Memory Cards entry without modifying the game internals

**Out of scope:**
- New player-name flow inside the Memory Cards game
- Additional games beyond Memory Cards in this phase
- Backend, auth, or cloud syncing
- Full multi-page routing or a broad catalogue app shell

## Architecture / Approach

The change stays at the Astro static-site layer: `src/pages/index.astro` owns the catalogue/game view state, the existing `MemoryGame` island remains in place for gameplay, and a small launcher helper supplies the catalogue score summary. This keeps the implementation lightweight and ensures future games can reuse the same shell shape without restructuring the app.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Catalogue shell and view-state toggle | The app can switch between catalogue and playable Memory Cards state | UI state gets tangled with the game island lifecycle |
| 2. Per-game top-score summary contract | Storage-facing summary for the launcher without touching game logic | Merge conflict with the separate Memory Cards naming branch |
| 3. Responsive catalogue polish | Final launcher UX and smoke verification | Small-screen usability or hidden regressions |

**Prerequisites:** The Memory Cards island and local score contracts already exist in the codebase.  
**Estimated effort:** ~1 implementation session across 3 focused phases.

## Open Risks & Assumptions

- The separate game branch may add naming support later; the launcher should not assume or mutate that contract now.
- The catalogue uses the existing page shell instead of full route-based navigation to keep performance and deployment simple.

## Success Criteria (Summary)

- The site opens to a retro catalogue and launches Memory Cards with one interaction.
- A player can return to the catalogue without reloading or breaking the game flow.
- The launcher remains responsive and passes Astro build checks with no regressions in the current Memory Cards implementation.
