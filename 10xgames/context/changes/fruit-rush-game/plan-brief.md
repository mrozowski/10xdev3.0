# Fruit Rush Game — Plan Brief

> Full plan: `context/changes/fruit-rush-game/plan.md`
> Research: `context/changes/fruit-rush-game/research.md`

## What & Why

Fruit Rush is the second complete game for 10xgames: a retro,
Suika-like fruit-merging game with gravity, collisions, chain merges, and a
danger-line loss condition. It expands the catalogue while preserving the
product's private, instant, browser-local experience and the existing
game-isolation architecture.

## Starting Point

The site has a static Astro catalogue and in-page Memory Cards view. The page
shell currently hardcodes Memory Cards launch wiring, while shared score,
statistics, and safe-storage modules already support game-scoped records. No
physics runtime or Fruit Rush assets exist.

## Desired End State

Players can launch Fruit Rush from a new catalogue card, aim and drop fruits
with pointer/touch or keyboard controls, watch matching fruits merge, and
restart after settled overflow. The responsive hybrid canvas/DOM game uses
authored SVG fruit visuals, saves completed scores/stats locally under its own
game ID, and leaves Memory Cards unchanged.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Physics | Bundled Matter.js adapter | Provides reliable collision simulation while keeping the import isolated to Fruit Rush. | Plan |
| Rendering | Hybrid canvas + DOM | Keeps moving visuals efficient while retaining semantic controls/status. | Plan |
| Input | Pointer/touch plus keyboard arrows/Space | Supports phones and keyboard operation without adding a second control model. | Plan |
| World | Responsive normalized logical world | Keeps physics tuning stable across device sizes. | Plan |
| Spawn | Current plus next-fruit preview | Adds planning and matches the selected game feel. | Plan |
| Merges | Immediate deterministic chains | Makes chain reactions responsive and testable. | Plan |
| Loss | Settled danger-line overflow | Avoids unfair losses from transient bounces. | Plan |
| Lifecycle | Restart-only | Keeps the first slice focused and avoids resume/pause state complexity. | Plan |
| Persistence | Save score/stats at game over only | Reuses the existing game-scoped contracts without partial-run writes. | Research / Plan |
| Art | Authored local SVG registry | Fits the retro, lightweight, scalable visual direction. | Plan |
| Tests | Unit-only engine/adapter coverage | Covers simulation risk without brittle real-time browser tests. | Plan |

## Scope

**In scope:** Fruit progression and score rules, Matter adapter, deterministic
unit tests, SVG registry/assets, hybrid game island, touch/pointer and keyboard
controls, next preview, restart, game-over persistence, catalogue launch
wiring, responsive styling, and build/type verification.

**Out of scope:** Backend/account features, cloud sync, active-board resume,
pause, remote assets, new game framework, Memory Cards redesign, keyboard
instruction copy, Playwright tests, and visual regression testing.

## Architecture / Approach

`FruitRushGame.astro` owns the browser lifecycle and rendering. It sends plain
commands to a pure rules engine and a Matter-only physics adapter:

`input → rules engine → Matter adapter → snapshots/contacts → rules engine → canvas + DOM`

At game over, the island writes the final score and generic statistics through
the existing `fruit-rush` namespace.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Game contracts and rules | Pure progression, merge, score, loss engine and tests | Ambiguous chain/loss behavior |
| 2. Matter adapter | Isolated collision simulation and adapter tests | Timing/body synchronization |
| 3. Island and integration | Playable UI, assets, controls, persistence, catalogue wiring | Cross-device interaction |
| 4. Release readiness | Full checks and human acceptance | Art/build/runtime regressions |

**Prerequisites:** Approved authored SVG fruit assets and the completed
S-05/S-06 platform foundations.  
**Estimated effort:** ~4 implementation phases across several focused sessions.

## Open Risks & Assumptions

- Matter.js adds a runtime dependency and must remain game-only in the bundle.
- Correctness-first simulation still requires elapsed-time and step caps to
  avoid tab-resume failures.
- The authored SVG set must be available before release; placeholder emoji are
  not an approved fallback.
- Unit-only testing leaves browser interaction and responsive acceptance to
  manual verification.

## Success Criteria (Summary)

- Fruit Rush launches from the catalogue and does not regress Memory Cards.
- Players can reliably aim, drop, merge, score, reach game over, and restart on
  touch and keyboard at supported viewport sizes.
- Rules and physics boundaries are deterministic and covered by unit tests,
  while completed scores/stats remain local and game-scoped.
