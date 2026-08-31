---
date: 2026-08-31T21:00:00.000Z
researcher: Copilot
git_commit: 70d34fe7082b1c5d44308dd8ff705de6345e1a59
branch: master
repository: mrozowski/10xdev3.0
topic: "Memory Cards base game mechanics, algorithm, retro dark UI, animations, and sound effects"
tags: [research, memory-cards, game-engine, retro-ui, web-audio, astro]
status: complete
last_updated: 2026-08-31
last_updated_by: Copilot
---

# Research: Memory Cards Base Game Mechanics, Algorithm, Retro Dark UI, Animations, and Sound Effects

**Date**: 2026-08-31T21:00:00.000Z  
**Researcher**: Copilot  
**Git Commit**: [70d34fe7082b1c5d44308dd8ff705de6345e1a59](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59)  
**Branch**: `master`  
**Repository**: `mrozowski/10xdev3.0`  

## Research Question

This slice represents building the entire base game Memory Cards (`first-memory-round` / S-01). We need research to understand how the game mechanics, pairing algorithm, and state transitions should look and work:
1. Standard memory card logic (remember pairs, click 2 cards to find matches).
2. Initial preview reveal & round timer rules from PRD.
3. Retro visual styling (dark background, easy on the eyes, glowing arcade accents).
4. Smooth animations (3D card flip transitions) and responsive layout (PC, tablet, mobile).
5. Retro 8-bit sound effects (procedural Web Audio API synthesis vs static assets).
6. Integration with existing contracts (`preferences.ts`, `scores.ts`, `storage.ts`, Astro island architecture, base path `/10xdev3.0`).

---

## Summary

- **Architecture**: A pure TypeScript game engine (`src/lib/memory-game/`) decoupled from the DOM handles deck generation, Fisher-Yates shuffling, state transitions, timer ticks, pair verification, and scoring. An interactive Astro client island (`src/components/game/MemoryGame.astro` or vanilla custom element) binds the engine to UI events and animations.
- **Card Deck & Pairing Algorithm**: First round uses 8 pairs (16 cards) arranged in a responsive 4x4 grid. The deck is generated from 8 distinct software-development symbols, duplicated into pairs with unique card IDs, and shuffled using standard Fisher-Yates.
- **Turn Flow & State Machine**: States include `idle` → `preview` (initial 3-second face-up reveal per PRD) → `playing` (active card flipping) → `checking` (input locked while comparing 2 cards, ~800ms) → `completed` (all 8 pairs matched) or `time_up` (if round timer expires).
- **Scoring Model**: Combines base match points (+150 pts), consecutive combo multiplier (`x1.0` up to `x2.5`), time-remaining bonus (+10 pts per second left), and a small mismatch penalty (-25 pts), preventing negative scores.
- **Retro Dark Aesthetic**: Dark slate/charcoal background (`#0d1117` / `#0a0a14`), glowing cyan/neon green accents (`#00f0ff`, `#00ff9f`, `#ff007f`), subtle scanlines/vignette overlay, and high-contrast accessible card faces.
- **CSS 3D Flip Animations**: Card flip achieved with hardware-accelerated CSS `transform: rotateY(180deg)` and `preserve-3d` / `backface-visibility: hidden` for 60fps performance on mobile.
- **Zero-Asset Audio Engine**: Procedural 8-bit sound generation using the native browser `Web Audio API` (`AudioContext` with square/triangle oscillators and short envelope decays). Delivers authentic retro bleeps for flip, match chime, mismatch buzz, countdown tick, and victory fanfare with 0kB asset download overhead. Respects `soundEnabled` preference from `preferences.ts`.

---

## Detailed Findings

### 1. Game State Machine & Deck Generation

The game lifecycle consists of well-defined states:

```
[ idle ] 
   │ Start Game
   ▼
[ preview ] ──── (3s countdown: all cards face up)
   │ Timer finishes
   ▼
[ playing ] ◄──────────────┐
   │ Click 1st card        │
   ▼                       │
[ 1 card flipped ]         │
   │ Click 2nd card        │
   ▼                       │ Mismatch (800ms cooldown)
[ checking ] ──────────────┘
   │
   ├─► Match: mark pairs, score += combo_pts, stay in [ playing ]
   │
   ├─► All 8 pairs matched ──► [ completed ] (Victory screen + final score)
   │
   └─► Timer reaches 0 ──────► [ time_up ] (Game Over screen)
```

- **Card Data Structure**:
  ```typescript
  export interface Card {
    id: number;          // 0..15 unique identifier
    symbolId: string;    // e.g. 'git', 'terminal', 'cpu', 'database'
    isFlipped: boolean;  // visible face up
    isMatched: boolean;  // successfully matched
  }
  ```

- **Fisher-Yates Shuffle**:
  ```typescript
  export function shuffleCards<T>(cards: T[]): T[] {
    const deck = [...cards];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  ```

- **Software Dev Theme Symbols (8 SVG Vector Icons)**:
  1. `terminal` (`>_`)
  2. `code` (`</>`)
  3. `git-branch` (branch icon)
  4. `database` (cylinder stack)
  5. `cpu` (microchip)
  6. `bug` (debug beetle)
  7. `rocket` (launch ship)
  8. `shield` (security badge)

### 2. Turn Rules & Scoring System

- **Initial Preview**:
  Per PRD Business Logic: *"The first round briefly reveals all card images before turning them face down."*  
  Duration: 3 seconds countdown with an on-screen visual progress bar / countdown badge before flipping all cards face-down.
- **Round Timer**:
  60 or 90 seconds limit for the 4x4 round.
- **Scoring Formula**:
  - Base match: `+150` points.
  - Consecutive streak multiplier: `+50 * comboStreak` (streak increments on match, resets to 0 on mismatch).
  - Mismatch penalty: `-25` points (score clamped at `min: 0`).
  - Time bonus upon win: `+10` points per remaining second.
  - Total Score: `Math.max(0, matchScore + (timeRemaining * 10))`.

### 3. Retro Dark UI & CSS 3D Card Animation

- **Color Palette & Visual Style**:
  - Background: Deep CRT dark `#0b0e14` with subtle radial vignette.
  - Panels / Cards back: Slate retro `#161b22` with pixel grid border `#30363d` and neon hover glow (`#00f0ff`).
  - Card front: `#1f242c` background with vibrant accent icons (`#00ff9f`, `#00f0ff`, `#ffb86c`, `#ff79c6`).
  - Typography: Crisp monospace / retro arcade font stack (`'Press Start 2P', ui-monospace, 'Courier New', monospace`).
- **3D Card Flip CSS**:
  ```css
  .card-container {
    perspective: 1000px;
  }
  .card-inner {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    transform-style: preserve-3d;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-inner.is-flipped,
  .card-inner.is-matched {
    transform: rotateY(180deg);
  }
  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 8px;
  }
  .card-front {
    transform: rotateY(180deg);
  }
  ```
- **Responsive Layout**:
  - Mobile (<640px): 4x4 grid fitting in viewport with `gap: 8px` and auto-scaling card sizes (approx 65-75px square).
  - Tablet/Desktop (≥640px): 4x4 grid capped at `max-width: 520px` with `gap: 12px` (approx 100-115px square).

### 4. Zero-Asset Web Audio Synthesizer

Rather than bundling audio MP3/WAV files that increase page weight and network latency, a procedural Web Audio synthesizer creates authentic 8-bit chip-tune sound effects directly in the browser:

- **Audio Engine Design (`src/lib/sound.ts`)**:
  - Singleton `AudioContext` created on first user gesture (`pointerdown`/`click`).
  - Integrates directly with `preferences.ts` (`soundEnabled`).
  - Synthesized effects:
    1. `playCardFlip()`: Quick triangle-wave pitch sweep (200Hz → 600Hz, 60ms).
    2. `playMatch()`: Ascending two-note major chord chime (square wave, 523Hz `C5` → 659Hz `E5` → 784Hz `G5`, 180ms).
    3. `playMismatch()`: Low double buzz (square/sawtooth wave, 150Hz → 110Hz, 120ms).
    4. `playPreviewTick()`: Soft short tick (800Hz, 30ms).
    5. `playVictory()`: 4-note ascending fanfare (523Hz → 659Hz → 784Hz → 1046Hz, 400ms).
    6. `playGameOver()`: Descending minor tones (300Hz → 220Hz → 150Hz, 400ms).

---

## Code References

- `src/lib/preferences.ts:3-10`: Theme (`'software-dev'`) and `soundEnabled` preference types ([link](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59/src/lib/preferences.ts#L3-L10)).
- `src/lib/preferences.ts:35-56`: `getPreferences()`, `setTheme()`, `setSoundEnabled()` APIs ([link](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59/src/lib/preferences.ts#L35-L56)).
- `src/lib/scores.ts:46-67`: `addScore({ name, score })` top-10 persistence API ([link](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59/src/lib/scores.ts#L46-L67)).
- `src/lib/storage.ts:8-21`: Silent-fallback localStorage wrapper ([link](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59/src/lib/storage.ts#L8-L21)).
- `astro.config.mjs:5-8`: Base path configuration (`/10xdev3.0`) for GitHub Pages ([link](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59/astro.config.mjs#L5-L8)).
- `src/pages/index.astro:1-11`: Astro entry page (currently placeholder starter) ([link](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59/src/pages/index.astro#L1-L11)).
- `src/layouts/Layout.astro:1-17`: Base layout shell ([link](https://github.com/mrozowski/10xdev3.0/blob/70d34fe7082b1c5d44308dd8ff705de6345e1a59/src/layouts/Layout.astro#L1-L17)).

---

## Architecture Insights

1. **Separation of Concerns**:
   - `src/lib/memory-game/engine.ts`: Pure state management, deterministic card generation, score calculation, unit-tested via Vitest without DOM dependencies.
   - `src/lib/sound.ts`: Web Audio procedural sound generation, mockable in tests.
   - `src/components/game/MemoryGame.astro`: Astro container island providing markup, CSS 3D card layout, controls (theme/sound toggle, reset), and client script.
   - `src/pages/index.astro`: Main catalogue view with title banner, retro arcade styling, game selector/launcher, and high score display integration.

2. **Zero Client Runtime Framework Overhead**:
   - By implementing the game island with typed Vanilla TypeScript / Web Component instead of React/Vue/Svelte, the bundle remains under ~15kB gzipped, guaranteeing the PRD's <2s load time.

3. **Base Path Resilience**:
   - All assets and navigation routes must respect `import.meta.env.BASE_URL` (configured as `/10xdev3.0` in `astro.config.mjs`).

---

## Historical Context (from prior changes)

- `context/changes/local-score-contract/plan.md`: Established the browser-local state contract for theme, sound, and scores without database or backend infrastructure.
- `context/changes/local-score-contract/reviews/impl-review.md`: Confirmed that `preferences.ts` and `scores.ts` are strictly separated, well-tested, and fail-safe.

---

## Open Questions & Proposed Answers for Planning

The following key questions have been analyzed to form the foundation for the implementation plan:

1. **Round Time Limit**:
   - *Recommendation*: **60 seconds** for 8 pairs (16 cards). Provides an engaging arcade pace while giving players enough time after the 3s preview.
2. **Initial Preview Duration**:
   - *Recommendation*: **3.0 seconds**. Allows players to take a quick mental snapshot without making the start feel sluggish.
3. **Score Saving Trigger in S-01**:
   - *Recommendation*: Calculate and display the score at the end of the round; in S-01, provide the completed round score screen with a "Play Again" button and integrate with `scores.ts` (with full frictionless name prompt workflow continuing into S-02).
4. **Theme Artwork**:
   - *Recommendation*: Curate 8 clean, retro-styled inline SVG developer icons (`terminal`, `code`, `git`, `database`, `cpu`, `bug`, `rocket`, `shield`) that scale crisply across all display densities.
