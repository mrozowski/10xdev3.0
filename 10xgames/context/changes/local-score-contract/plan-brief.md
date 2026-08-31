# Local Score State and Theme Configuration Contract — Plan Brief

> Full plan: `context/changes/local-score-contract/plan.md`

## What & Why

Build the foundational browser-local state contract for 10x Games: TypeScript modules that store player theme/sound preferences and a capped list of Memory Cards scores, entirely in `localStorage`. This is roadmap item F-01 — a foundation with no UI, unlocking S-01 (`first-memory-round`) and S-02 (`local-score-replay`).

## Starting Point

Fresh Astro 7 starter repo: only unmodified starter pages/components exist, no `src/lib/`, no test runner, no storage utilities. Strict TypeScript is already enforced via `tsconfig.json` (`astro/tsconfigs/strict`).

## Desired End State

Game code (built in later slices) can call `getPreferences()`/`setTheme()`/`setSoundEnabled()` and `getScores()`/`addScore()` to read/write local state, with all `localStorage` failures handled silently so gameplay never breaks. Vitest runs a full unit test suite via `npm run test`.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Score record shape | `{ name, score, date }` only | User wants minimal schema now, extend later if needed | Plan |
| Theme storage | Separate "preferences" record from scores | Theme/sound are session-spanning settings, not part of a scored round | Plan |
| Storage tech | `localStorage` | Synchronous, simplest fit for tiny JSON payloads, no backend | Plan |
| Score retention | Top 10 by score, descending | Keeps the local high-score list meaningful without unbounded growth | Plan |
| API shape | Two modules (`preferences.ts`, `scores.ts`) over a shared `storage.ts` wrapper | Clean separation of concerns; one safety layer reused by both | Plan |
| Generated score name | `"Anonymous"` | Simplest default satisfying FR-007's "never blocks replay" requirement | Plan |
| Storage failure handling | Silent no-op (never throws) | Game must stay playable even if storage is disabled/full/private-browsing | Plan |
| Testing approach | Add Vitest (jsdom environment) | First test runner in repo; enables mocking `localStorage` cleanly | Plan |

## Scope

**In scope:** `src/lib/storage.ts`, `src/lib/preferences.ts`, `src/lib/scores.ts`, their unit tests, and Vitest setup (`vitest.config.ts`, `package.json` script/deps).

**Out of scope:** Any UI/Astro components, game/round logic, name-entry flow, IndexedDB/cookies/backend storage, score fields beyond name/score/date, data migration/versioning, e2e tests.

## Architecture / Approach

Two independent, side-effect-free TypeScript modules (`preferences.ts`, `scores.ts`) each own one `localStorage` key and JSON shape, both routed through a single shared `storage.ts` safe-read/write wrapper that swallows all storage errors. Vitest with `jsdom` environment provides a real `window.localStorage`-shaped global for tests.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Vitest setup | Test runner + `npm run test` script | Low — pure tooling addition |
| 2. Shared storage wrapper | Silent-failure `safeGetItem`/`safeSetItem` | Must correctly swallow all failure modes so later modules can trust it |
| 3. Preferences contract | Theme + sound get/set, defaults, corrupt-data fallback | Theme union must anticipate S-01's need to enumerate themes |
| 4. Scores contract | Top-10 score list with add/sort/cap, "Anonymous" default | Sort/cap/tie-break logic must be exactly right since S-02 depends on it |

**Prerequisites:** None — first change in the repo beyond the Astro starter scaffold.
**Estimated effort:** ~1 session, 4 small phases, no UI work.

## Open Risks & Assumptions

- Assumes `jsdom` is an acceptable new dev dependency alongside `vitest` (needed for a real `localStorage` global in tests) — not explicitly asked, but standard pairing for this test shape.
- Assumes the theme registry seeded here (starting with the software-development theme) is a placeholder list that S-01/future theme work will extend, not the final theme catalogue.

## Success Criteria (Summary)

- `npm run test` passes for all four phases' unit tests.
- `npm run astro -- check` reports no new type errors.
- Manually verified: preferences/scores persist across a reload, and calls never throw when `localStorage` is stubbed to fail.
