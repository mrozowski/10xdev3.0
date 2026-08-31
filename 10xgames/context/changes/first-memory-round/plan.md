# Memory Cards First Full Round Flow Implementation Plan

## Overview

Deliver the first complete, playable Memory Cards game experience for 10x Games (`first-memory-round` / S-01). Players can launch Memory Cards from the retro game catalogue, configure theme and sound preferences, experience an initial 3-second face-up preview reveal, flip cards in a responsive 4x4 3D animated grid to find pairs within a 60-second limit, hear procedural 8-bit retro sound effects, calculate dynamic combo scores, and view the victory/defeat summary with instant replay capability.

## Current State Analysis

- Astro 7 static-site framework configured with `base: '/10xdev3.0'` in `astro.config.mjs`.
- Foundation state contracts already implemented and tested in `src/lib/`:
  - `preferences.ts` handles `theme` (`'software-dev'`) and `soundEnabled` (boolean) with silent localStorage fallback.
  - `scores.ts` handles `addScore` and `getScores` keeping the top-10 sorted records.
  - `storage.ts` provides a non-throwing wrapper around `localStorage`.
- `vitest` is set up with jsdom environment and passes existing unit tests via `npm run test`.
- `src/pages/index.astro` and `src/layouts/Layout.astro` currently contain default Astro starter template boilerplate.
- No game engine, audio engine, or game UI components exist yet.

## Desired End State

- `src/lib/memory-game/engine.ts`: Pure TypeScript game engine handling deck generation, Fisher-Yates shuffle for 8 pairs (16 cards), timer/preview countdowns, turn state machine (`idle` → `preview` → `playing` → `checking` → `completed` | `time_up`), combo multipliers, and score calculations, fully covered by unit tests.
- `src/lib/sound.ts`: Web Audio API procedural 8-bit sound synthesizer generating retro sounds (flip, match chime, mismatch buzz, countdown tick, victory fanfare, game over) respecting `soundEnabled` preference.
- `src/lib/memory-game/themes.ts`: Curated retro SVG developer icons (`terminal`, `code`, `git-branch`, `database`, `cpu`, `bug`, `rocket`, `shield`).
- `src/components/game/MemoryGame.astro`: Astro client island with hardware-accelerated CSS 3D card flip animations, status HUD (timer, score, combos, preview bar), sound/theme toggles, and victory/defeat modal screens.
- `src/pages/index.astro` & `src/layouts/Layout.astro`: Retro dark arcade CRT shell (`#0b0e14`, neon cyan/green accents) presenting the game catalogue with Memory Cards launcher.

**Verification**:
- `npm run test` passes all unit tests for engine, sound, and storage.
- `npm run astro -- check` passes with zero type errors.
- `npm run build` succeeds cleanly with static HTML/CSS/JS artifacts under `dist/`.
- Manual testing verifies instant play, 3s preview reveal, responsive 4x4 card grid, 3D flip animation, 8-bit audio on user gesture, combo scoring, and score saving on victory.

### Key Discoveries:

- Astro strict tsconfig requires full explicit types and zero `any` usage (`tsconfig.json`).
- Assets and links must be resilient to the GitHub Pages base path `/10xdev3.0` (`astro.config.mjs`).
- Pure TS game engine decoupling allows 100% deterministic unit testing without DOM mocks or browser timers.
- Web Audio API procedural synthesis avoids external audio asset downloads, keeping initial page load under PRD's 2-second target.

## What We're NOT Doing

- No multi-round campaign progression (Round 2+ difficulty scaling with 20/30 cards is post-MVP / future slice).
- No backend, accounts, server APIs, or cloud database (explicit PRD non-goals).
- No multi-page router for games; single-page catalogue with game launcher keeps the MVP lightweight and instant.
- No external audio asset loading (MP3/WAV files) — procedural synthesis only.
- No complex custom player ranking or leaderboard UI beyond the top-10 list.

## Implementation Approach

Build the feature in 5 modular phases:
1. **Engine Layer**: Pure, deterministic state machine with complete test suite.
2. **Audio Layer**: Web Audio procedural synthesizer with preference integration and safe fallbacks.
3. **Themes & Visuals**: Vector iconography and theme registry for software-dev cards.
4. **Game Island UI**: Interactive Astro component with CSS 3D flip animations and HUD.
5. **Catalogue Shell**: Retro CRT theme, base layout, and catalogue launcher on index page.

## Critical Implementation Details

- **Web Audio Gesture Unlock**: Browsers require user interaction before `AudioContext` can transition from `suspended` to `running`. Initialize or resume `AudioContext` on the first user click/tap.
- **Base Path Prefixing**: Internal navigation and absolute links must use Astro's `import.meta.env.BASE_URL` to work properly on GitHub Pages (`/10xdev3.0`).
- **CSS 3D Backface Visibility**: In Safari/WebKit, `backface-visibility: hidden` requires `-webkit-backface-visibility: hidden` and `transform-style: preserve-3d` on the parent card element for smooth 60fps card flips without rendering glitches.

---

## Phase 1: Pure Game Engine & Logic

### Overview

Implement the pure TypeScript Memory Cards engine in `src/lib/memory-game/engine.ts` with comprehensive unit tests in `src/lib/memory-game/engine.test.ts`.

### Changes Required:

#### 1. Game Engine Types and Logic

**File**: `src/lib/memory-game/engine.ts`

**Intent**: Define the game state machine, card representation, Fisher-Yates deck shuffle, 3-second preview timer, 60-second game timer, match detection, combo multipliers, and score calculations.

**Contract**:
- Export `GameState`: `{ status: 'idle' | 'preview' | 'playing' | 'checking' | 'completed' | 'time_up'; cards: Card[]; flippedIndices: number[]; score: number; combo: number; matchedPairs: number; totalPairs: number; previewSecondsRemaining: number; roundSecondsRemaining: number }`.
- Export `createInitialGameState(symbolIds: string[], totalPairs?: number): GameState`.
- Export `flipCard(state: GameState, cardIndex: number): { nextState: GameState; event?: 'flip' | 'match' | 'mismatch' | 'completed' }`.
- Export `resolveMismatch(state: GameState): GameState`.
- Export `tickPreview(state: GameState): GameState`.
- Export `tickTimer(state: GameState): GameState`.
- Export `calculateFinalScore(score: number, timeRemaining: number): number`.

#### 2. Engine Unit Tests

**File**: `src/lib/memory-game/engine.test.ts`

**Intent**: Test all state transitions: initial deck creation (16 cards, 8 pairs), card flipping constraints (cannot flip already flipped/matched cards), match scoring with combo streaks, mismatch cooldown, preview countdown to playing transition, timer expiration to `time_up`, and final victory score calculation.

### Success Criteria:

#### Automated Verification:

- Unit tests pass: `npm run test -- src/lib/memory-game/engine.test.ts`
- Strict type checking passes: `npm run astro -- check`

#### Manual Verification:

- None for this phase — purely algorithmic, verified by automated unit tests.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 2: Retro Procedural Sound Synthesizer

### Overview

Implement procedural 8-bit retro sound effect synthesis using Web Audio API in `src/lib/sound.ts` with unit tests in `src/lib/sound.test.ts`.

### Changes Required:

#### 1. Sound Synthesizer Module

**File**: `src/lib/sound.ts`

**Intent**: Provide lightweight procedural 8-bit sound synthesis that checks `getPreferences().soundEnabled` before playing, handles browser audio unlock on user interaction, and never throws in non-browser or disabled audio environments.

**Contract**:
- Export `playSound(effect: 'flip' | 'match' | 'mismatch' | 'tick' | 'victory' | 'gameover'): void`.
- Export `initAudioContext(): void`.
- Export `setAudioMuted(muted: boolean): void`.

#### 2. Sound Synthesizer Tests

**File**: `src/lib/sound.test.ts`

**Intent**: Verify sound calls respect preference state, degrade safely when `AudioContext` is unavailable, and invoke proper oscillator/gain schedules.

### Success Criteria:

#### Automated Verification:

- Unit tests pass: `npm run test -- src/lib/sound.test.ts`
- Type checking passes: `npm run astro -- check`

#### Manual Verification:

- None for this phase — verified by automated test mocks.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 3: Card SVGs & Theme Registry

### Overview

Create the software-dev theme SVG icon set and theme metadata registry in `src/lib/memory-game/themes.ts`.

### Changes Required:

#### 1. Theme and Icons Registry

**File**: `src/lib/memory-game/themes.ts`

**Intent**: Define 8 distinct, crisp, neon-styled developer vector icons (`terminal`, `code`, `git-branch`, `database`, `cpu`, `bug`, `rocket`, `shield`) and theme definitions mapping to `preferences.ts`.

**Contract**:
- Export `DEV_THEME_SYMBOLS`: array of 8 symbol definitions with IDs, labels, and inline SVG paths.
- Export `getThemeSymbols(theme: Theme)` returning the symbol list for the selected theme.

#### 2. Theme Tests

**File**: `src/lib/memory-game/themes.test.ts`

**Intent**: Verify that `getThemeSymbols('software-dev')` returns exactly 8 valid symbols with non-empty SVG paths.

### Success Criteria:

#### Automated Verification:

- Unit tests pass: `npm run test -- src/lib/memory-game/themes.test.ts`
- Type checking passes: `npm run astro -- check`

#### Manual Verification:

- None for this phase — verified by unit tests.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 4: Game Island & Retro UI

### Overview

Build the interactive `src/components/game/MemoryGame.astro` client island containing the 4x4 card grid, 3D flip animation styles, HUD, sound/theme controls, and victory/game over modals.

### Changes Required:

#### 1. Memory Game Component

**File**: `src/components/game/MemoryGame.astro`

**Intent**: Render the game board HUD (score, combo streak, 60s timer, 3s preview countdown bar), sound on/off toggle button, 4x4 grid of cards with front/back 3D flip styling, and modal overlays for victory (displaying score, time bonus, and Play Again button) and game over.

**Contract**:
- CSS contains hardware-accelerated 3D flip styles (`perspective`, `transform-style: preserve-3d`, `rotateY(180deg)`).
- Client script binds engine state machine to DOM elements and sound triggers.
- Automatically saves completed victory scores via `addScore` from `src/lib/scores.ts`.

### Success Criteria:

#### Automated Verification:

- Astro typecheck passes: `npm run astro -- check`
- Full test suite passes: `npm run test`

#### Manual Verification:

- Cards flip with smooth 60fps 3D rotation without visual glitching.
- 3-second preview reveals cards face-up, counts down, then flips face-down.
- Matching pairs stay face-up and trigger match sound; mismatches flip back after brief cooldown.
- Victory screen shows final calculated score and saves score to local list.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 5: Landing Page & Catalogue Shell Integration

### Overview

Update `src/layouts/Layout.astro` and `src/pages/index.astro` to provide the retro arcade CRT theme, game catalogue launcher, and clean base path resolution for GitHub Pages.

### Changes Required:

#### 1. Base Layout Shell

**File**: `src/layouts/Layout.astro`

**Intent**: Establish the global dark retro arcade theme, custom fonts, glowing accents, base-path-aware meta and favicon tags, and CRT scanline overlay.

**Contract**:
- Support dynamic page titles.
- Set base-path-safe links for assets (`favicon.svg`).
- Provide shared retro theme styles and color variables.

#### 2. Landing Page & Catalogue

**File**: `src/pages/index.astro`

**Intent**: Replace the starter boilerplate with the 10x Games retro header, game catalogue card for Memory Cards ("Click to Play"), high scores preview panel, and modal/container launching `MemoryGame.astro`.

**Contract**:
- Renders the catalogue grid with Memory Cards as the primary active game.
- Includes quick-start launcher entering Memory Cards immediately.

#### 3. Remove Starter Welcome Component

**File**: `src/components/Welcome.astro` (delete file or replace)

**Intent**: Clean up default Astro starter template component.

### Success Criteria:

#### Automated Verification:

- Typecheck passes: `npm run astro -- check`
- Production build succeeds: `npm run build`
- Unit tests pass: `npm run test`

#### Manual Verification:

- Open `npm run preview` or dev server: landing page displays retro arcade catalogue.
- Clicking "Play Memory Cards" launches the game smoothly on desktop and mobile viewport sizes.
- Audio plays on user tap/click when sound is enabled; mute button silences audio.
- Completing a game round updates the high score list.

---

## Testing Strategy

### Unit Tests:

- `src/lib/memory-game/engine.test.ts`: Complete coverage of card shuffling, state transitions, preview countdown, timer ticks, pair matching, streak combo multipliers, and score calculations.
- `src/lib/sound.test.ts`: Sound synthesis triggers and preference checks.
- `src/lib/memory-game/themes.test.ts`: Theme symbol registry and SVG completeness.
- `src/lib/scores.test.ts`, `src/lib/preferences.test.ts`, `src/lib/storage.test.ts`: Continued regression safety.

### Integration / Build Tests:

- `npm run astro -- check`
- `npm run test`
- `npm run build`

### Manual Testing Steps:

1. Open http://localhost:4321/10xdev3.0/ on desktop and mobile screen sizes.
2. Verify retro arcade visual styling, scanline effects, and typography.
3. Start Memory Cards round: confirm 3-second preview reveals cards then flips them face-down.
4. Play round: click cards, verify 3D flip animation, match chime, mismatch buzz, and combo counter.
5. Win round: verify victory fanfare, score calculation (base + combo + time bonus), and appearance in high scores list.
6. Test mute toggle: verify sound disables and persists across reloads.
7. Test timer expiration: verify game over screen when 60s timer expires.

## Performance Considerations

- Zero external asset requests for sounds or icon images — all generated procedurally or with inline SVGs, keeping initial load < 15kB gzipped.
- CSS 3D transforms (`rotateY`, `perspective`) use GPU-accelerated compositing for 60fps animations on mobile devices.

## Migration Notes

None. Replaces the temporary Astro starter boilerplate with the initial game catalogue.

## References

- Research: `context/changes/first-memory-round/research.md`
- Roadmap: `context/foundation/roadmap.md` (S-01: first-memory-round)
- PRD: `context/foundation/prd.md` (FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01)
- Existing Contracts: `src/lib/preferences.ts`, `src/lib/scores.ts`, `src/lib/storage.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Pure Game Engine & Logic

#### Automated

- [x] 1.1 Unit tests pass: npm run test -- src/lib/memory-game/engine.test.ts — 76eec6c
- [x] 1.2 Strict type checking passes: npm run astro -- check — 76eec6c

### Phase 2: Retro Procedural Sound Synthesizer

#### Automated

- [x] 2.1 Unit tests pass: npm run test -- src/lib/sound.test.ts — b0262c6
- [x] 2.2 Type checking passes: npm run astro -- check — b0262c6

### Phase 3: Card SVGs & Theme Registry

#### Automated

- [x] 3.1 Unit tests pass: npm run test -- src/lib/memory-game/themes.test.ts — fbae554
- [x] 3.2 Type checking passes: npm run astro -- check — fbae554

### Phase 4: Game Island & Retro UI

#### Automated

- [x] 4.1 Astro typecheck passes: npm run astro -- check — af36eff
- [x] 4.2 Full test suite passes: npm run test — af36eff

#### Manual

- [x] 4.3 Cards flip with smooth 60fps 3D rotation without visual glitching — af36eff
- [x] 4.4 3-second preview reveals cards face-up, counts down, then flips face-down — af36eff
- [x] 4.5 Matching pairs stay face-up and trigger match sound; mismatches flip back after brief cooldown — af36eff
- [x] 4.6 Victory screen shows final calculated score and saves score to local list — af36eff

### Phase 5: Landing Page & Catalogue Shell Integration

#### Automated

- [x] 5.1 Typecheck passes: npm run astro -- check — bbecaca
- [x] 5.2 Production build succeeds: npm run build — bbecaca
- [x] 5.3 Unit tests pass: npm run test — bbecaca

#### Manual

- [x] 5.4 Open preview or dev server: landing page displays retro arcade catalogue — bbecaca
- [x] 5.5 Clicking Play Memory Cards launches the game smoothly on desktop and mobile viewport sizes — bbecaca
- [x] 5.6 Audio plays on user tap/click when sound is enabled; mute button silences audio — bbecaca
- [x] 5.7 Completing a game round updates the high score list — bbecaca
