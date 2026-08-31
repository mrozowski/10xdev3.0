# Memory Cards First Full Round Flow — Plan Brief

> Full plan: `context/changes/first-memory-round/plan.md`
> Research: `context/changes/first-memory-round/research.md`

## What & Why

Deliver the first complete, playable Memory Cards game experience for 10x Games (`first-memory-round` / S-01). This proves the core product promise of instant, private, installation-free retro gaming on common devices with responsive 3D card flips, 8-bit sound effects, and local scoring.

## Starting Point

The repository has an Astro 7 static-site foundation configured for GitHub Pages (`/10xdev3.0`) with foundation contracts in `src/lib/` for preferences (`theme`, `soundEnabled`), local scores (`addScore`, `getScores`), and safe storage. The UI currently contains default Astro starter boilerplate (`index.astro`, `Layout.astro`, `Welcome.astro`).

## Desired End State

A player visits the site, sees a dark retro arcade catalogue, clicks Play on Memory Cards, gets an initial 3-second preview reveal of 16 cards (8 pairs, 4x4 grid), plays within a 60-second timer with smooth 3D flips and 8-bit sounds, achieves combo multipliers, and views their victory score summary with instant replay.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Audio Engine | Web Audio API procedural synthesis | Zero asset downloads keep initial load under 2 seconds while producing authentic 8-bit bleeps. | Plan |
| Component Framework | Vanilla TypeScript client island in Astro | Lightweight, zero framework runtime overhead, and clean lifecycle management. | Plan |
| Page Navigation | Single-page catalogue + game view switcher | Delivers instantaneous game launch without full page navigations. | Plan |
| Round Timer | 60 seconds with 3.0s initial preview | Offers an engaging arcade challenge while honoring the PRD's preview reveal requirement. | Research / Plan |
| Score Handling | Automatic score calculation + local save on victory | Immediate feedback with seamless progression into the S-02 replay loop. | Research / Plan |

## Scope

**In scope:**
- Pure TypeScript Memory Cards state machine and deck shuffling algorithm.
- Procedural Web Audio 8-bit sound synthesizer for flip, match, mismatch, tick, victory, and game over.
- 8 software-development themed retro vector icons.
- Interactive Astro game island with CSS 3D flip animations and HUD.
- Dark retro arcade catalogue shell on `index.astro` and `Layout.astro`.

**Out of scope:**
- Multi-round campaign scaling (20/30 cards for round 2+ is post-MVP).
- Backend, accounts, login, or cloud syncing.
- Multi-page routing across different games.
- External audio file assets (MP3/WAV).

## Architecture / Approach

A decoupled architecture where `src/lib/memory-game/engine.ts` manages pure game state and score calculation (100% unit-tested in Vitest), `src/lib/sound.ts` synthesizes audio in response to state transitions, and `src/components/game/MemoryGame.astro` binds the engine to a GPU-accelerated 3D DOM card grid.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Pure Game Engine & Logic | Pure TS state machine, deck shuffle, timer ticks, combo score calculation | Edge cases in state transitions or timer expiration |
| 2. Retro Procedural Sound Synthesizer | Web Audio 8-bit sound generator respecting `preferences.ts` | Browser audio context auto-play policies |
| 3. Card SVGs & Theme Registry | 8 developer vector icons and theme registry | Icon scaling/rendering across densities |
| 4. Game Island & Retro UI | Astro client island, CSS 3D flips, HUD, victory/game over modals | Mobile layout and 3D flip animation smoothness |
| 5. Landing Page & Shell Integration | Retro CRT shell, catalogue card, and base-path-safe launcher | Base path (`/10xdev3.0`) navigation asset bugs |

**Prerequisites:** Foundation contracts (`preferences.ts`, `scores.ts`, `storage.ts`) and Vitest runner already in place.  
**Estimated effort:** ~1-2 implementation sessions across 5 focused phases.

## Open Risks & Assumptions

- User interaction is required to unlock Web Audio `AudioContext` — handled by initializing audio on the first card click/tap.
- WebKit/Safari requires `-webkit-backface-visibility: hidden` for 3D card flips — handled in CSS definitions.

## Success Criteria (Summary)

- Complete Memory Cards round is playable from start to finish on mobile, tablet, and desktop.
- 3-second preview reveal, 60s round timer, 3D flip animations, and 8-bit audio work smoothly.
- All unit tests (`npm run test`) and type checks (`npm run astro -- check`) pass cleanly.
