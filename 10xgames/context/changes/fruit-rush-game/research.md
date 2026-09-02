---
date: 2026-09-02T21:53:59.113+00:00
researcher: Copilot
git_commit: dbb82f1894d407f379d8984443daf757537c1c52
branch: feature/fruit-rush-game
repository: mrozowski/10xdev3.0
topic: "Fruit Rush game integration and implementation research"
tags: [research, codebase, fruit-rush, astro, game-architecture, physics]
status: complete
last_updated: 2026-09-02
last_updated_by: Copilot
last_updated_note: "Added follow-up research for roadmap sequencing"
---

# Research: Fruit Rush game integration and implementation research

**Date**: 2026-09-02T21:53:59.113+00:00  
**Researcher**: Copilot  
**Git Commit**: `dbb82f1894d407f379d8984443daf757537c1c52`  
**Branch**: `feature/fruit-rush-game`  
**Repository**: `mrozowski/10xdev3.0`

## Research Question

Determine how to add Fruit Rush, a retro Suika-like physics-based fruit-merging game, to the existing 10xgames platform while preserving game isolation and limiting platform changes to the new game catalogue entry and required launch wiring.

## Summary

Fruit Rush fits the existing static Astro architecture as an isolated client-side game island with a pure TypeScript engine. The catalogue layout is already responsive and generic, but the current page hardcodes the Memory Cards card, heading, launcher, and view lifecycle events, so a playable game requires small, explicit changes in `src/pages/index.astro` in addition to a new `FruitRushGame.astro` component and `src/lib/fruit-rush/engine.ts`.

Existing score, statistics, storage, accessibility, responsive styling, and reduced-motion conventions can be reused with a distinct `fruit-rush` game ID. No physics engine or canvas/game runtime is installed. The main unresolved planning decisions are the physics model, rendering/input approach, asset strategy, scoring and merge semantics, loss condition, and test contract. The roadmap should gain a Fruit Rush slice, ideally after the game-scoped score/stat contract is finalized.

## Detailed Findings

### Platform integration

- `src/lib/catalog.ts:1-13` defines an extensible `GameCatalogueEntry` and currently contains only `memory-cards`; adding `{ id: 'fruit-rush', ... }` is appropriate, although the current page does not consume this registry.
- `src/pages/index.astro:18-39` hardcodes the catalogue card, shared game view, Memory Cards heading, and `<MemoryGame />`. The catalogue grid itself already supports multiple responsive cards at `:175-181`, so no layout redesign is needed.
- `src/pages/index.astro:50-85` selects only the Memory Cards launcher and dispatches Memory-specific lifecycle events. A playable Fruit Rush entry must add its own launch/view branch or generalize this small shell contract, while preserving Memory behavior.
- `src/layouts/Layout.astro:1-23` and `astro.config.mjs:1-8` provide the document shell and GitHub Pages configuration; neither contains game registration and neither needs modification for this feature.

### Game architecture

- `src/components/game/MemoryGame.astro:155-191` demonstrates the project convention: static Astro markup plus an inline client-side class that owns the interactive lifecycle.
- `src/lib/memory-game/engine.ts:1-36,68-155,157-343` keeps state transitions pure, serializable, and testable independently of the DOM. Fruit Rush should use a separate engine rather than extending the turn-based Memory engine.
- A Fruit Rush engine should define explicit fruit entities and serializable game state, deterministic stepping/collision/merge operations, and explicit events for drops, merges, invalid drops, and game over. A fixed timestep or injected random source is important for reliable tests.
- Continuous physics should use `requestAnimationFrame` in the island, with elapsed-time capping and centralized cleanup. Rendering and physics should remain separate; canvas is likely more scalable for many bodies, while DOM rendering may simplify accessibility.

### Persistence, scores, and statistics

- `src/lib/storage.ts:1-22` provides safe localStorage wrappers for unavailable storage and quota failures.
- `src/lib/scores.ts:3-24,34-70,92-149` validates, sorts, caps, and scopes score records by arbitrary `gameId`; use `fruit-rush` without changing the shared schema.
- `src/lib/stats.ts:3-32,93-123,126-197` likewise supports game-scoped play time, points, completion, and last-played metrics. Fruit Rush should not overload Memory-specific `roundsCompleted` semantics.
- Active physics state should remain runtime-only unless resume behavior is explicitly added. Persist completed scores and generic statistics through the existing contracts.

### Presentation, assets, and input

- `src/lib/memory-game/themes.ts:1-14,16+` provides a lightweight registry pattern for visual symbols. Fruit definitions can use a similar registry while keeping artwork/assets independent from physics logic.
- No physics library, canvas loop, pointer/touch abstraction, or game runtime is currently installed. `package.json:19-31` lists Astro and test/tooling dependencies only; adding Matter.js, Phaser, or another runtime would be a material stack decision.
- Existing styling in `src/components/game/MemoryGame.astro:847-852,1453-1479` establishes namespaced global styles for dynamic markup, responsive sizing, focus states, and reduced-motion behavior. The lesson in `context/foundation/lessons.md` requires `:global()` whenever styles must reach dynamically rendered or child markup.
- The product supports desktop, tablet, and phone use (`context/foundation/prd.md:36-38,83-84,96-98`). Fruit Rush must define pointer/touch controls and an accessible keyboard alternative before implementation.

### Requirements and testing

- The change brief defines gravity, same-type touching merges, a full-container loss condition, and progression from Blueberry through Coconut (`context/changes/fruit-rush-game/change.md:10-25`), but does not define the numerical physics, spawn behavior, score values, final-fruit behavior, merge ordering, or exact overflow rule.
- Existing unit tests cover pure engines and persistence; existing E2E conventions use role-based locators, state-based waits, independent setup, and storage cleanup (`tests/seed.spec.ts:4-49`, `tests/helpers/test-utils.ts:3-20`).
- Begin with deterministic unit tests for collision detection, merge replacement, chain merges, scoring, boundaries, and game-over detection. Add a focused E2E flow for launch, drop, merge, restart, and loss; avoid pixel-level assertions.

## Code References

- [`src/pages/index.astro`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/src/pages/index.astro) — catalogue markup, view switching, and lifecycle events.
- [`src/lib/catalog.ts`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/src/lib/catalog.ts) — catalogue entry type and current game registry.
- [`src/components/game/MemoryGame.astro`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/src/components/game/MemoryGame.astro) — client island, lifecycle, responsive and dynamic styling patterns.
- [`src/lib/memory-game/engine.ts`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/src/lib/memory-game/engine.ts) — pure engine/state-transition pattern.
- [`src/lib/scores.ts`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/src/lib/scores.ts) and [`src/lib/stats.ts`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/src/lib/stats.ts) — reusable game-scoped persistence.
- [`context/foundation/prd.md`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/context/foundation/prd.md) — MVP privacy, device, performance, and presentation constraints.
- [`context/foundation/roadmap.md`](https://github.com/mrozowski/10xdev3.0/blob/dbb82f1894d407f379d8984443daf757537c1c52/context/foundation/roadmap.md) — current milestone status and sequencing.

## Architecture Insights

1. Keep Fruit Rush isolated under `src/lib/fruit-rush/` and `src/components/game/FruitRushGame.astro`; do not couple its physics state to Memory Cards.
2. Treat the catalogue as presentation/navigation and reuse the existing static view-switching model rather than introducing routes, backend state, or a game framework.
3. Prefer a lightweight custom physics solver unless planning demonstrates that a dependency is necessary. This preserves the selected zero-JS-by-default Astro stack and keeps the landing page lightweight.
4. Use the shared `fruit-rush` score/stat namespace and existing safe storage helpers, while keeping physics runtime state ephemeral.
5. Namespace dynamic game styles and include responsive, focus, keyboard, touch, and reduced-motion behavior from the start.

## Historical Context (from prior changes)

- `context/changes/first-memory-round/research.md` records the decision to use a pure TypeScript engine with an Astro island instead of a UI/game framework.
- `context/changes/game-catalogue-launcher/plan.md` establishes the static catalogue and view-switcher model.
- `context/changes/local-score-stats-crud/plan-brief.md` requires game-scoped scoreboards specifically to support future games.
- `context/changes/progressive-memory-rounds/plan.md` shows that Memory scoring/progression is game-specific and should not dictate Fruit Rush semantics.
- `context/foundation/roadmap.md:178-182` identifies adding games as the growth direction after the Memory Cards work; Fruit Rush should be represented as a new roadmap slice rather than folded into Memory work.

## Related Research

- `context/changes/first-memory-round/research.md`
- `context/changes/game-catalogue-launcher/plan.md`
- `context/changes/local-score-stats-crud/research.md`
- `context/changes/progressive-memory-rounds/research.md`

## Open Questions

- Should Fruit Rush use a custom fixed-timestep solver or introduce a physics dependency?
- Should rendering use canvas for scalability or accessible DOM elements for simpler semantics?
- What are the supported drop controls, horizontal movement rules, cooldown, pause/restart behavior, and keyboard fallback?
- What container dimensions, gravity, friction, restitution, collision tolerance, overflow line, and maximum body count produce the intended difficulty?
- What score does each merge award, can Coconut merge further, and how are simultaneous or chain merges ordered?
- Which fruit artwork, sound, and loading strategy is available while preserving the initial-load target?
- Which Fruit Rush metrics map to the generic statistics API, and should the roadmap sequence this after completion of S-06?

## Follow-up Research 2026-09-02T21:58:20.259+00:00

The roadmap should be updated. Fruit Rush is a complete second game with its
own engine, interaction model, testing scope, and game-scoped score/stat usage,
so it should not be hidden as a note under the existing Memory Cards slices.

The roadmap now closes the previously completed milestones and opens a
dedicated post-Memory milestone:

- **M-01: Memory Cards MVP** remains done.
- **M-02: CRUD local score management** is marked done, including S-06.
- **M-03: Additional games** is open, with S-07 (`fruit-rush-game`) as its
  planned vertical slice.
- S-07 depends on S-05 and S-06 because it needs catalogue launch wiring and
  the finalized per-game local score/stat contract.

The formerly parked “Additional games beyond Memory Cards” item was removed
from the parked section because it is now represented by M-03/S-07. The
milestone history records completion of M-01 and M-02.
