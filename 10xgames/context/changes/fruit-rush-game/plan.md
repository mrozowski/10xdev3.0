# Fruit Rush Game Implementation Plan

## Overview

Implement Fruit Rush as the second complete 10xgames title: a retro,
Suika-like game in which the player aims and drops fruits, fruits fall and
collide, matching fruits merge through an 11-step progression, and the run
ends when settled fruit remains above the danger line. The game remains an
isolated Astro island with local-only score/stat persistence and no changes to
the shared layout or deployment model.

## Current State Analysis

The site uses a static Astro page with a hardcoded Memory Cards catalogue card,
game view, launcher, and Memory-specific lifecycle events
(`src/pages/index.astro:18-85`). The catalogue type is extensible but is not
currently rendered from its registry (`src/lib/catalog.ts:1-13`).

Memory Cards establishes the project pattern of a pure TypeScript engine plus a
client-side Astro controller (`src/lib/memory-game/engine.ts`,
`src/components/game/MemoryGame.astro:155-274`). Shared score, statistics, and
safe-storage modules accept game IDs and can support Fruit Rush without schema
changes (`src/lib/scores.ts`, `src/lib/stats.ts`, `src/lib/storage.ts`).

No physics runtime exists. The approved design adds bundled Matter.js, but
keeps it behind `src/lib/fruit-rush/physics-adapter.ts`; the pure rules engine
must not import Matter. The product requires phone, tablet, and desktop
support, private browser-local play, and a lightweight initial catalogue load
(`context/foundation/prd.md:36-38,83-84,94-99`).

## Desired End State

The catalogue shows a Fruit Rush card. Selecting it opens the game without
leaving the page, while Memory Cards continues to launch and return correctly.
The player sees a responsive normalized playfield, current and next fruit
previews, score, danger line, and a hybrid canvas/DOM presentation. Pointer and
touch aim/drop controls work, keyboard arrows and Space are supported, and
restart is available after game over.

Fruit Rush has deterministic, unit-tested rules for progression, scoring,
collision-driven merges, chain reactions, boundaries, and settled overflow.
Matter.js performs the physical simulation through a replaceable adapter. A
completed run writes the final score and generic game statistics under
`fruit-rush`; active board state is not persisted.

### Key Discoveries:

- The page shell is the only platform launch integration point; `Layout.astro`
  and `astro.config.mjs` do not need changes.
- Existing storage APIs are game-scoped, so Fruit Rush should use `gameId:
  'fruit-rush'` rather than adding a new persistence schema.
- Dynamic or child game markup needs `:global()` styling, per the accepted
  lesson in `context/foundation/lessons.md`.
- Matter.js must be bundled with the game island, not loaded from a CDN, to
  preserve self-contained local play and avoid initial catalogue payload.
- The final SVG art set is a release prerequisite; tests may use deterministic
  fixture metadata but emoji/CDN visuals are not launch fallbacks.

## What We're NOT Doing

- No backend, accounts, cloud synchronization, analytics, ads, or remote
  asset/CDN loading.
- No active-board resume or cross-session physics persistence.
- No changes to Memory Cards gameplay or its engine.
- No general game framework, global physics abstraction, or route-per-game
  redesign.
- No pause feature in this slice; restart-only lifecycle is intentional.
- No keyboard instruction/tutorial copy in this slice, although keyboard
  operation remains supported.
- No Playwright/E2E test addition in this plan; automated coverage is
  unit-only as selected.
- No visual regression suite or pixel-perfect physics assertions.

## Implementation Approach

Create a Fruit Rush-specific domain model and pure reducer-like rules engine.
Represent physics data crossing the Matter boundary as plain serializable
snapshots and contacts. The adapter owns Matter world/body lifecycle and
fixed-step advancement; the Astro island owns requestAnimationFrame,
input/render synchronization, lifecycle cleanup, and persistence side
effects.

Use a normalized logical world scaled to the measured responsive container.
Render moving fruit and the container on canvas, with semantic DOM controls and
status/score elements layered around it. Resolve matching contacts through a
deterministic engine order, replace merged bodies through adapter commands, and
continue chain merges before evaluating settled danger-line overflow.

## Critical Implementation Details

### Timing & lifecycle

The island must cap elapsed time and Matter steps per animation frame so a
background-tab resume cannot produce an uncontrolled physics jump. Since the
approved lifecycle is restart-only, visibility changes may stop rendering and
release the loop, but they must not serialize or restore the active board.

### Performance constraints

Matter.js is a game-only dependency and must not execute while the catalogue is
shown. The implementation should prioritize simulation correctness over a
strict frame-rate guarantee, while bounding work per frame and avoiding
unbounded bodies/effect nodes.

### State sequencing

Merge events must remove both source bodies before creating the next-level
body, update score exactly once, and then permit newly eligible chain merges.
Game-over evaluation must ignore actively falling/newly dropped fruits and only
start the danger-line grace timer for settled overflow.

## Phase 1: Game Contracts and Deterministic Rules

### Overview

Define the complete Fruit Rush domain contract independently of the DOM and
Matter.js. Encode the progression, normalized geometry assumptions, score
values, next-fruit queue, merge ordering, and loss/restart state transitions.

### Changes Required:

#### 1. Fruit metadata and shared types

**Files**: `src/lib/fruit-rush/fruits.ts`, `src/lib/fruit-rush/types.ts`

**Intent**: Add the 11-fruit progression from Blueberry through Coconut,
including stable IDs, display labels, normalized radius/visual metadata, and
level-weighted merge scores. Define plain state, body snapshot, contact,
physics command, and event types shared by the engine, adapter, and island.

**Contract**: Fruit IDs and progression order are stable; Coconut has no next
level; all cross-module physics values are serializable and contain no Matter
types.

#### 2. Pure Fruit Rush rules engine

**File**: `src/lib/fruit-rush/engine.ts`

**Intent**: Implement initial/restart state, injected random next-fruit
selection, horizontal aim/drop validation, deterministic immediate chain
merges, level-weighted scoring, and settled danger-line overflow handling.

**Contract**: Public operations accept/return plain state and DTOs, emit
explicit events for accepted/rejected drops, merges, score changes, and game
over, and never import `matter-js`. Same-level contacts resolve in a stable
order; Coconut contacts do not upgrade and do not award a merge score.

#### 3. Engine unit tests

**File**: `src/lib/fruit-rush/engine.test.ts`

**Intent**: Lock down behavior before browser orchestration exists, using
injected random values and fake physics snapshots/contacts.

**Contract**: Cover progression and final-fruit behavior, initial/next state,
drop boundaries and rejection, score calculation, simultaneous contacts,
chain merges, deterministic ordering, settled danger-line grace behavior,
game-over transition, and restart reset.

### Success Criteria:

#### Automated Verification:

- Fruit Rush domain and engine tests pass with `npm run test -- src/lib/fruit-rush/engine.test.ts`.
- The engine and types compile without Matter.js imports.
- Type checking passes with `npm run astro -- check`.

#### Manual Verification:

- Review the fruit progression, score table, and loss/restart rules against the
  change brief and approved decisions.

## Phase 2: Matter.js Physics Adapter

### Overview

Add the bundled Matter.js dependency and implement a replaceable adapter that
translates normalized Fruit Rush commands/state into Matter bodies and back
into plain snapshots and contacts.

### Changes Required:

#### 1. Dependency and adapter

**Files**: `package.json`, `package-lock.json`,
`src/lib/fruit-rush/physics-adapter.ts`

**Intent**: Add Matter.js as a runtime dependency and isolate world creation,
container bounds, fruit bodies, fixed-step advancement, collision extraction,
and body replacement/removal behind a Fruit Rush-specific adapter.

**Contract**: Only `physics-adapter.ts` imports Matter.js. The adapter exposes
plain commands/snapshots, uses normalized-to-rendered coordinate conversion at
the island boundary, constrains bodies to the container, and caps stepping
work. No Matter object escapes the adapter.

#### 2. Adapter tests

**File**: `src/lib/fruit-rush/physics-adapter.test.ts`

**Intent**: Verify the real adapter contract without depending on browser
  animation timing.

**Contract**: Cover fixed-step downward motion, floor/wall constraints,
stable same-level contact extraction, source-body removal and merged-body
creation, snapshot serialization, and bounded stepping.

#### 3. Import-boundary regression test

**File**: `src/lib/fruit-rush/boundary.test.ts`

**Intent**: Prevent future rules code from coupling directly to Matter.

**Contract**: Assert that engine/types/fruits contain no Matter imports and that
the adapter is the sole Matter import in the Fruit Rush library.

### Success Criteria:

#### Automated Verification:

- Matter adapter tests pass with `npm run test -- src/lib/fruit-rush/physics-adapter.test.ts src/lib/fruit-rush/boundary.test.ts`.
- `npm run astro -- check` passes with strict TypeScript types.
- `npm run build` succeeds with Matter.js included only in the game bundle path.

#### Manual Verification:

- Inspect the built output or preview behavior to confirm catalogue-only
  loading does not initialize the physics world.
- Confirm fruits remain inside the container on a narrow viewport and that
  merged bodies do not duplicate or disappear unexpectedly.

## Phase 3: Fruit Rush Island and Platform Integration

### Overview

Build the browser-facing hybrid game, wire it into the catalogue/view shell,
and connect game-over persistence without changing shared layout or Memory
Cards behavior.

### Changes Required:

#### 1. SVG fruit registry

**Files**: `src/lib/fruit-rush/assets.ts` and the supplied SVG asset files
under `src/assets/` or `public/`

**Intent**: Add the complete authored SVG fruit set and a metadata registry
that maps stable fruit IDs to visual assets, keeping artwork separate from
physics and controller code.

**Contract**: All 11 fruit IDs have an authored visual; asset URLs resolve
under the configured GitHub Pages base path; no emoji or remote CDN fallback is
used for release.

#### 2. Fruit Rush Astro island

**File**: `src/components/game/FruitRushGame.astro`

**Intent**: Add static HUD, hybrid canvas/DOM playfield, next-fruit preview,
score/danger status, pointer/touch aim/drop interaction, keyboard arrows/Space
support, restart action, and the requestAnimationFrame controller.

**Contract**: The controller coordinates engine and adapter only through their
public DTOs, renders normalized snapshots responsively, cleans up RAF/listener
handles on view close, and exposes semantic labelled controls/status without
adding keyboard instruction copy. Restart resets the active simulation but
does not persist board state.

#### 3. Catalogue and view wiring

**Files**: `src/lib/catalog.ts`, `src/pages/index.astro`

**Intent**: Add the Fruit Rush catalogue entry and a targeted second-game
branch to the existing page shell, preserving the Memory Cards card, heading,
events, back navigation, and platform time handling.

**Contract**: Fruit Rush launches from `data-game-launch="fruit-rush"` and
renders only when selected; Memory Cards continues to use its existing
`memory-game:view-opened` and `memory-game:view-closed` contract. Shared shell
changes must not duplicate game state or introduce routing.

#### 4. Scores and statistics

**Files**: `src/components/game/FruitRushGame.astro`, shared score/stat
modules only if type contracts require a narrowly scoped extension

**Intent**: Record the final score and generic completed-game statistics once
at game over under `fruit-rush`, using existing safe local storage and score
entry behavior. Record game time on cleanup/view close as established by the
platform.

**Contract**: No active-run score writes; no cross-game score contamination;
game-over persistence is idempotent; abandoned/restarted active runs do not
appear as completed scores.

#### 5. Scoped responsive styles

**File**: `src/components/game/FruitRushGame.astro`

**Intent**: Match the retro visual language with responsive container sizing,
focus states, touch-action rules, and readable status controls.

**Contract**: Dynamic/child selectors use `:global()` where Astro scoping would
otherwise prevent styling; styles remain namespaced to Fruit Rush and include
small-screen geometry safeguards.

### Success Criteria:

#### Automated Verification:

- `npm run astro -- check` passes.
- Existing tests pass with `npm run test`.
- `npm run build` succeeds with the new island, assets, and catalogue entry.
- Static search confirms both launch IDs and their view event handling are wired.

#### Manual Verification:

- Launch Fruit Rush from the catalogue and return to the catalogue; launch
  Memory Cards afterward and confirm it is unchanged.
- Aim and drop with pointer/touch and with arrow keys/Space.
- Observe next-fruit preview, gravity, wall/floor collisions, same-fruit
  merging, score changes, danger-line feedback, and restart after game over.
- Check the layout on narrow phone-sized and desktop-sized viewports.
- Confirm authored SVG visuals load when served beneath `/10xdev3.0/`.

## Phase 4: Verification and Release Readiness

### Overview

Run the repository's available quality gates, review the final boundaries, and
close the roadmap slice only after the game meets the agreed manual acceptance
criteria.

### Changes Required:

#### 1. Final test and build pass

**Files**: Existing implementation and tests

**Intent**: Verify the complete Fruit Rush slice and ensure no regression in
the existing Memory Cards experience.

**Contract**: Unit tests, Astro checks, production build, and repository
format checks are clean; no new test runner or lint tool is introduced.

#### 2. Roadmap/change state

**Files**: `context/foundation/roadmap.md`,
`context/changes/fruit-rush-game/change.md`

**Intent**: Leave planning artifacts accurately describing implementation
status; implementation tooling will advance progress and roadmap state when
phases land.

**Contract**: Do not mark S-07 or the change complete during planning; those
statuses change only after implementation and acceptance.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes.
- `npm run astro -- check` passes.
- `npm run build` passes.
- `git diff --check` passes.

#### Manual Verification:

- A human confirms the complete core loop is playable on touch and keyboard,
  visually coherent with 10xgames, and stable through repeated merges and
  restart.

## Testing Strategy

### Unit Tests:

- Fruit metadata progression, radii, score table, and Coconut terminal rule.
- Pure engine initialization, injected next-fruit selection, aim/drop
  boundaries, rejected drops, merge scoring, chain ordering, and restart.
- Danger-line settled grace period and game-over idempotence.
- Matter adapter fixed stepping, bounds, contact extraction, body replacement,
  serialization, and capped work.
- Import-boundary test ensuring only the adapter imports Matter.

### Integration Tests:

No Playwright tests are planned for this slice by user choice. The Astro
island is validated through the existing type/build checks and manual browser
acceptance; all high-risk simulation behavior is covered at the engine/adapter
unit boundary.

### Manual Testing Steps:

1. Open the catalogue and confirm Fruit Rush is available without initializing
   its physics runtime.
2. Launch Fruit Rush, aim with pointer/touch, drop several fruits, and confirm
   the next preview and score HUD update.
3. Repeat with keyboard arrows and Space.
4. Force matching contacts and confirm immediate merges, chain reactions, and
   level-weighted score increments.
5. Fill the danger area, verify settled overflow ends the run, then restart.
6. Reload the site and confirm only completed Fruit Rush scores/stats persist;
   active board state does not resume.
7. Repeat the flow at phone and desktop viewport sizes and launch Memory Cards
   afterward to check for regressions.

## Performance Considerations

Matter.js is loaded only through the Fruit Rush island. Keep the logical world
normalized, cap elapsed time and simulation steps, avoid unbounded visual
effects, and keep active body counts bounded by the container and game-over
rule. Correct simulation behavior takes priority over a hard 60 FPS promise,
but the loop must remain responsive on supported mobile hardware.

## Migration Notes

No data migration is required. Fruit Rush uses the existing game-scoped score
and statistics keys with `gameId: 'fruit-rush'`; active physics state is not
stored. If shared score APIs need a type-only extension for non-Memory
completion metadata, preserve backward compatibility for existing records.

## References

- Related research: `context/changes/fruit-rush-game/research.md`
- Change brief: `context/changes/fruit-rush-game/change.md`
- Roadmap slice: `context/foundation/roadmap.md` (S-07)
- Engine pattern: `src/lib/memory-game/engine.ts`
- Island pattern: `src/components/game/MemoryGame.astro`
- Launcher shell: `src/pages/index.astro`
- Storage contracts: `src/lib/scores.ts`, `src/lib/stats.ts`,
  `src/lib/storage.ts`
- Styling lesson: `context/foundation/lessons.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Game Contracts and Deterministic Rules

#### Automated

- [ ] 1.1 Fruit Rush domain and engine tests pass
- [ ] 1.2 Engine and types compile without Matter.js imports
- [ ] 1.3 Type checking passes with `npm run astro -- check`

#### Manual

- [ ] 1.4 Review progression, scoring, loss, and restart rules

### Phase 2: Matter.js Physics Adapter

#### Automated

- [ ] 2.1 Matter adapter and boundary tests pass
- [ ] 2.2 Strict Astro type checking passes
- [ ] 2.3 Production build succeeds with game-only Matter.js loading

#### Manual

- [ ] 2.4 Verify catalogue-only loading and responsive collision behavior

### Phase 3: Fruit Rush Island and Platform Integration

#### Automated

- [ ] 3.1 Astro type checking passes
- [ ] 3.2 Existing unit tests pass
- [ ] 3.3 Production build succeeds with island, assets, and catalogue entry
- [ ] 3.4 Launch IDs and view event handling are wired

#### Manual

- [ ] 3.5 Verify both games launch/return without regressions
- [ ] 3.6 Verify pointer/touch and keyboard controls
- [ ] 3.7 Verify merging, scoring, danger-line feedback, and restart
- [ ] 3.8 Verify phone/desktop layout and GitHub Pages asset paths

### Phase 4: Verification and Release Readiness

#### Automated

- [ ] 4.1 Full unit test suite passes
- [ ] 4.2 Astro check passes
- [ ] 4.3 Production build passes
- [ ] 4.4 `git diff --check` passes

#### Manual

- [ ] 4.5 Human acceptance confirms the complete Fruit Rush loop
