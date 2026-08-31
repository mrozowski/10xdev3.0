# Local Score State and Configuration Contract Implementation Plan

## Overview

We're building the foundational, browser-local state contract for 10x Games: a small set of TypeScript modules that let game code read/write the player's theme and sound preferences, and read/write a capped, sorted list of locally saved Memory Cards scores. This is a foundation item (F-01 on the roadmap) — it unlocks S-01 (`first-memory-round`) and S-02 (`local-score-replay`) but contains no UI or game logic itself.

## Current State Analysis

The repository is an unmodified Astro 7 starter:

- `src/pages/index.astro` and `src/components/Welcome.astro` are starter boilerplate, not yet touched by product work.
- `src/layouts/Layout.astro` is the shared document shell.
- No `src/lib/` directory, no storage utilities, no test runner, and no `vitest`/`node:test` config exist yet.
- `tsconfig.json` extends `astro/tsconfigs/strict`, so strict TypeScript is already enforced project-wide — new modules must satisfy strict mode (no implicit `any`, strict null checks).
- `package.json` has only `astro` as a dependency and `dev`/`build`/`preview`/`astro` scripts. No `test` script exists.
- No database, backend, or auth exists or is planned (PRD Non-Goals) — this contract is the entire persistence layer for the MVP.

## Desired End State

After this change:

- `src/lib/preferences.ts` exports functions to read and update the player's theme and sound-on/off preference, backed by `localStorage`, safe to call even when storage is unavailable.
- `src/lib/scores.ts` exports functions to read the current score list and add a new score, automatically retaining only the top 10 by score (descending), safe to call even when storage is unavailable.
- `src/lib/storage.ts` provides a shared safe-read/safe-write wrapper around `localStorage` used by both modules, so failures (quota exceeded, storage disabled, private browsing) never throw and never break gameplay.
- Vitest is configured as the project's test runner (first test runner in this repo), with unit tests covering preferences, scores, and the storage wrapper, all passing.
- `npm run test` runs the full unit test suite.

**Verification**: `npm run test` passes; `npm run astro -- check` passes with no new type errors; manual REPL/browser check confirms preferences and scores persist across a page reload and degrade silently when `localStorage` is stubbed to throw.

### Key Discoveries:

- Astro strict tsconfig (`tsconfig.json`) means all new modules must be fully typed — no `any`, explicit return types recommended for exported functions.
- No existing test runner or `test` script — Vitest must be added and wired as a new dependency and script, this is a net-new tool for the repo (allowed per task scope: "add Vitest" was an explicit user decision, not a pre-existing convention).
- The PRD explicitly separates the *scoring* concern (FR-004/FR-007, transient per-round data) from the *preferences* concern (FR-003, theme/sound persist across sessions) — confirmed with the user that these must be two independently stored records, not one combined blob.

## What We're NOT Doing

- No UI, components, or Astro islands — this change is pure `src/lib/` TypeScript, no `.astro` files touched.
- No game logic, round state, or timer/pairs logic (belongs to S-01 `first-memory-round`).
- No "enter your name after a round" UI flow (belongs to S-01/S-02) — this change only provides the `addScore` function that flow will call.
- No IndexedDB, cookies, or server-side storage — `localStorage` only, per user decision.
- No score fields beyond `name`, `score`, `date` — no theme, difficulty, duration, or pairs-found tracking in the score record (explicit user decision to keep it minimal; extend later if needed).
- No migration/versioning scheme for stored data shape — out of scope until a real schema change is needed.
- No e2e/browser automation tests — unit tests with a mocked `localStorage` only.

## Implementation Approach

Two small, independent, side-effect-free modules (`preferences.ts`, `scores.ts`) sit on top of one shared safety wrapper (`storage.ts`). Each module owns its own `localStorage` key and JSON shape. All storage failures are swallowed at the `storage.ts` layer so `preferences.ts`/`scores.ts` callers never need try/catch. Vitest is introduced fresh since no test runner exists; tests mock `window.localStorage` via `vi.stubGlobal` or a simple in-memory `Storage` polyfill.

## Phase 1: Vitest setup

### Overview

Add Vitest as the project's first test runner so subsequent phases can ship with tests from the start.

### Changes Required:

#### 1. Test runner dependency and config

**File**: `package.json`

**Intent**: Add `vitest` as a dev dependency and a `test` script so `npm run test` (and `npm run test -- --watch`) work.

**Contract**: New `devDependencies.vitest` entry; new `"test": "vitest run"` script (and optionally `"test:watch": "vitest"`).

#### 2. Vitest configuration

**File**: `vitest.config.ts`

**Intent**: Configure Vitest with a `jsdom`-less Node environment is not sufficient since we need a `localStorage` global — use `environment: "jsdom"` (add `jsdom` as a dev dependency too) so `window.localStorage` exists in tests without hand-rolled polyfills.

**Contract**: Exports a Vitest config with `test.environment = "jsdom"` and `test.include` matching `src/**/*.test.ts`.

### Success Criteria:

#### Automated Verification:

- `npm install` completes cleanly with new dev dependencies
- `npm run test` runs (reports 0 tests found, since no test files exist yet) with exit code 0

#### Manual Verification:

- None for this phase — infrastructure only, verified by later phases' passing tests

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Shared storage safety wrapper

### Overview

Build the one shared utility both `preferences.ts` and `scores.ts` depend on: a safe read/write wrapper around `localStorage` that never throws.

### Changes Required:

#### 1. Storage wrapper module

**File**: `src/lib/storage.ts`

**Intent**: Provide `safeGetItem(key: string): string | null` and `safeSetItem(key: string, value: string): void` functions that wrap `localStorage.getItem`/`setItem` in try/catch, returning `null` / doing nothing on failure (quota exceeded, storage disabled, `localStorage` undefined in non-browser context) — per user decision, storage failures degrade silently rather than throwing or falling back to an in-memory store.

**Contract**: Two exported functions with the signatures above; no other module in this change accesses `window.localStorage` directly — both `preferences.ts` and `scores.ts` must go through this wrapper.

#### 2. Storage wrapper tests

**File**: `src/lib/storage.test.ts`

**Intent**: Verify safe read/write happy path, and verify both functions degrade silently (no throw) when `localStorage.getItem`/`setItem` are stubbed to throw.

**Contract**: Test cases: successful get/set round-trip; `getItem` throwing returns `null`; `setItem` throwing does not propagate.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes for `src/lib/storage.test.ts`
- `npm run astro -- check` reports no new type errors

#### Manual Verification:

- None — fully covered by unit tests

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Preferences contract (theme + sound)

### Overview

Deliver the preferences module: a string-literal typed theme, a boolean sound toggle, and get/set functions backed by the Phase 2 storage wrapper.

### Changes Required:

#### 1. Preferences module

**File**: `src/lib/preferences.ts`

**Intent**: Define a `Theme` string-literal union (starting with the software-development theme required by FR-006/Business Logic, e.g. `"software-dev"`, extendable later per PRD's Secondary success criteria on additional themes) and export `getPreferences()` / `setTheme(theme: Theme)` / `setSoundEnabled(enabled: boolean)`, reading/writing a single JSON-serialized preferences record through `storage.ts`. Unknown/missing/corrupt stored data falls back to sensible defaults (first theme in registry, sound enabled).

**Contract**: `Preferences = { theme: Theme; soundEnabled: boolean }`; a `THEMES: readonly Theme[]` registry array is exported so future UI (S-01) can enumerate available themes without hardcoding the union elsewhere. Storage key is namespaced, e.g. `"10xgames:preferences"`, distinct from the scores key.

#### 2. Preferences tests

**File**: `src/lib/preferences.test.ts`

**Intent**: Verify defaults when nothing is stored, verify round-trip persistence of theme and sound changes, verify corrupt/malformed stored JSON falls back to defaults instead of throwing.

**Contract**: Test cases: default preferences on empty storage; `setTheme` then `getPreferences` reflects the change; `setSoundEnabled` then `getPreferences` reflects the change; malformed JSON in storage does not throw and yields defaults.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes for `src/lib/preferences.test.ts`
- `npm run astro -- check` reports no new type errors

#### Manual Verification:

- None — fully covered by unit tests

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Scores contract (top-10 list)

### Overview

Deliver the scores module: a minimal score record (name, score, date), an `addScore` function enforcing top-10-by-score-descending retention, and an "Anonymous" generated default name per FR-007.

### Changes Required:

#### 1. Scores module

**File**: `src/lib/scores.ts`

**Intent**: Export `ScoreEntry = { name: string; score: number; date: string }`, `getScores(): ScoreEntry[]` (returns the current list, best-first), and `addScore(entry: { name?: string; score: number }): ScoreEntry[]` which defaults `name` to `"Anonymous"` when omitted/blank, appends a `date` (ISO string, generated internally), inserts into the existing list, re-sorts descending by score, truncates to the top 10, persists, and returns the updated list — per user decision on schema (name/score/date only, no theme/difficulty) and retention (top 10 by score, ties broken by insertion order).

**Contract**: Storage key namespaced separately from preferences, e.g. `"10xgames:scores"`. `addScore` never throws even if storage fails to persist (relies on Phase 2's silent-failure wrapper) — the returned in-memory list still reflects the new entry so calling UI can show it even if persistence silently failed.

#### 2. Scores tests

**File**: `src/lib/scores.test.ts`

**Intent**: Verify empty list on first read, verify `addScore` persists and sorts correctly, verify the 10-entry cap drops the lowest score, verify the default "Anonymous" name is applied when no name is given.

**Contract**: Test cases: `getScores()` returns `[]` initially; adding one score returns it in the list; adding 11 scores keeps only the top 10 by score; omitting `name` yields `"Anonymous"`; adding a lower score than existing top 10 does not evict a higher one.

### Success Criteria:

#### Automated Verification:

- `npm run test` passes for `src/lib/scores.test.ts` (and the full suite: `npm run test`)
- `npm run astro -- check` reports no new type errors

#### Manual Verification:

- In a local dev session (`npm run dev`), open the browser console and confirm calling `addScore`/`getScores` (temporarily exposed via a scratch import or console snippet) persists across a page reload and that stubbing `localStorage.setItem` to throw does not break the calls

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- `storage.ts`: safe get/set happy path and throw-swallowing behavior.
- `preferences.ts`: defaults, round-trip persistence, corrupt-data fallback.
- `scores.ts`: empty state, add/sort/cap behavior, default-name behavior.

### Integration Tests:

- Not applicable — no UI or cross-module integration exists yet in this change; S-01/S-02 will exercise these modules end-to-end.

### Manual Testing Steps:

1. Run `npm run dev`, open browser dev tools, and manually call the exported functions (e.g. via a temporary console import or a scratch script) to confirm preferences and scores persist in `localStorage` across a reload.
2. In dev tools, override `localStorage.setItem`/`getItem` to throw, then repeat the same calls and confirm no uncaught exceptions appear and the app keeps functioning.
3. Add 11+ scores manually and confirm only the top 10 (by score) remain.

## Performance Considerations

All operations are synchronous `localStorage` reads/writes on small JSON payloads (max 10 score entries + one preferences object) — negligible performance impact, no debouncing or async handling needed.

## Migration Notes

Not applicable — this is a net-new contract with no prior stored data format to migrate from.

## References

- Roadmap: `context/foundation/roadmap.md` (F-01: local-score-contract)
- PRD: `context/foundation/prd.md` (FR-003, FR-007, US-02)
- Change identity: `context/changes/local-score-contract/change.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Vitest setup

#### Automated

- [x] 1.1 npm install completes cleanly with new dev dependencies — 09bf08c
- [x] 1.2 npm run test runs with exit code 0 (0 tests found) — 09bf08c

### Phase 2: Shared storage safety wrapper

#### Automated

- [x] 2.1 npm run test passes for src/lib/storage.test.ts — 5eaf468
- [x] 2.2 npm run astro -- check reports no new type errors — 5eaf468

### Phase 3: Preferences contract (theme + sound)

#### Automated

- [x] 3.1 npm run test passes for src/lib/preferences.test.ts — ceec955
- [x] 3.2 npm run astro -- check reports no new type errors — ceec955

### Phase 4: Scores contract (top-10 list)

#### Automated

- [x] 4.1 npm run test passes for src/lib/scores.test.ts (full suite)
- [x] 4.2 npm run astro -- check reports no new type errors

#### Manual

- [x] 4.3 Console-verified persistence across reload and silent failure when localStorage throws
