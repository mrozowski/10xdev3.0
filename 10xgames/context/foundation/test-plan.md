# Test Plan

> Phased test rollout for this project. Strategy is frozen at the top
> (§1–§5); cookbook patterns at the bottom (§6) fill in as phases ship.
> Read before writing any new test.
>
> Refresh: re-run `/10x-test-plan --refresh` when stale (see §8).
>
> Last updated: 2026-09-02

## 1. Strategy

Tests follow three non-negotiable principles for this project:

1. **Cost × signal.** The cheapest test that gives a real signal for the
   risk wins. Do not promote to e2e because e2e "feels safer." Do not put a
   vision model on top of a deterministic visual diff that already catches
   the regression.
2. **User concerns are first-class evidence.** Risks anchored in "the team
   is worried about X, and the failure would surface somewhere in an area"
   carry the same weight as PRD lines or hot-spot data.
3. **Risks are scenarios, not code locations.** This plan documents *what
   could fail* and *why we believe it's likely* — drawn from documents,
   interview, and codebase *signal* (churn, structure, test base). It does
   NOT claim to know which line owns the failure. That knowledge is
   produced by `/10x-research` during each rollout phase. If the plan and
   research disagree about where the failure lives, research is the
   ground truth.

Hot-spot scope used for likelihood weighting: `src/`.

## 2. Risk Map

The top failure scenarios are ordered by risk = impact × likelihood. The
Source column cites evidence that surfaced a risk, not where it lives in code.

| # | Risk (failure scenario) | Impact | Likelihood | Source (evidence — not anchor) |
|---|---|---|---|---|
| 1 | The landing page or Memory Cards game does not load or start. | High | High | PRD `prd.md:75-81,98`; interview Q1/Q4; hot-spot dirs `src/components/` (7 changes/30d), `src/pages/` (5) |
| 2 | A player cannot choose Memory Cards from the catalogue or return after play. | High | High | PRD `prd.md:42-50,77`; roadmap `roadmap.md:118-129`; interview Q3/Q4; hot-spot dirs `src/components/`, `src/pages/` |
| 3 | Saving a score, replaying, or leaving becomes blocked or loses local score data. | Medium | Medium | PRD `prd.md:53-57,92,99`; roadmap `roadmap.md:92-103`; hot-spot dir `src/lib/` (23 changes/30d) |
| 4 | A locally entered player name is rendered or persisted unsafely. | Medium | Low | PRD `prd.md:53-57,92,109-111` |
| 5 | Memory Cards accepts matching and non-matching pairs incorrectly, preventing a player from completing a round as intended. | High | Medium | PRD `prd.md:75-81,98-101`; roadmap `roadmap.md:104-115` |

### Risk Response Guidance

| Risk | What would prove protection | Must challenge | Context `/10x-research` must ground | Likely cheapest layer | Anti-pattern to avoid |
|---|---|---|---|---|---|
| #1 | A fresh visit loads the catalogue, selects the game, and starts a playable round. | A successful build proves client-island startup. | Route, island, and browser boundaries. | Build check + browser e2e | Happy-path-only assertions |
| #2 | Selection and return preserve a usable navigation loop. | Rendering a card means its action works. | Interaction and navigation state. | Browser e2e | Snapshot without behavior |
| #3 | Completing a round saves a usable local score without blocking replay or exit. | Storage success in one browser mode proves the flow. | Storage boundary and completion lifecycle. | Unit + integration | Over-mocking internal state |
| #4 | Empty, long, and special-character names do not throw; saved names remain text and do not corrupt the score list. | Local-only input needs no validation. | Input normalization, persistence, and rendering boundary. | Unit + integration | Production-derived expected values |
| #5 | A pair is marked found only when its cards match; a non-matching pair remains playable. | A completed round proves every individual pair was evaluated correctly. | Pair identity and match-state transition. | Unit only | Assertions copied from the production match rule |

## 3. Phased Rollout

| # | Phase name | Goal (one line) | Risks covered | Test types | Status | Change folder |
|---|---|---|---|---|---|---|
| 1 | Load and launcher critical path | Prove a visitor can load, choose, start, and return from the game. | #1, #2 | build verification + browser e2e | complete | testing-load-and-launcher-critical-path |
| 2 | Game-state and local-score contracts | Preserve correct pair evaluation, frictionless local scores, and safe local names. | #3, #4, #5 | unit + integration; unit only for pair matching | complete | — |
| 3 | Quality-gate wiring | Make critical-path and contract checks repeatable before deployment. | cross-cutting | local + CI gates | not started | — |

## 4. Stack

| Layer | Tool | Version | Notes |
|---|---|---|---|
| unit + integration | Vitest + jsdom | 4.1.11 / 30.0.1 | Configured; six tests cluster in `src/lib`. |
| browser e2e | none yet — see Phase 1 | — | Research must confirm the cheapest browser layer for island startup. |
| CI gates | GitHub Actions | — | Deployment target and default flow are recorded in `tech-stack.md`. |
| AI-native | none planned | — | No extra signal over deterministic checks is justified. |

**Stack grounding tools (current session):**
- Docs: no Context7; official Vitest guide checked for current setup guidance; checked: 2026-09-01
- Search: web search available; not needed beyond the official documentation; checked: 2026-09-01
- Runtime/browser: no Playwright or browser MCP available; browser automation is a Phase 1 research decision; checked: 2026-09-01
- Provider/platform: GitHub tooling available for future CI inspection; not used to infer failure anchors; checked: 2026-09-01

## 5. Quality Gates

| Gate | Where | Required? | Catches |
|---|---|---|---|
| Astro production build | local + CI | required after §3 Phase 1 | broken static output and load regressions |
| critical launcher flow | local + CI | required after §3 Phase 1 | broken catalogue, startup, and return behavior |
| Vitest contracts | local + CI | required after §3 Phase 2 | pair-evaluation, storage, and input regressions |
| pre-deploy smoke | between merge + deploy | planned in §3 Phase 3 | environment-specific launch failures |

## 6. Cookbook Patterns

### 6.1 Adding a unit test

- `src/lib/memory-game/engine.test.ts` covers deterministic pair matching and
  progressive-round transitions.
- `src/lib/scores.test.ts` covers empty, long, and special-character names
  through local persistence.

### 6.2 Adding an integration test

- The local score contract is covered at the module/storage boundary by
  `src/lib/scores.test.ts`; the rendered normal-name save and replay boundary
  is covered by `tests/local-score-replay.spec.ts`.

### 6.3 Adding an end-to-end test

- Seed example: `tests/seed.spec.ts` covers Risk #2 (catalogue selection and return loop) with `getByRole` selectors, state-based waits, a unique `playwright-seed-*` session id in local storage, and cleanup via `localStorage.clear()`.
- Follow the same pattern for future Phase 1 E2E tests: assert navigation and game-start state, not timing-based behavior.

### 6.4 Risk #4 contract coverage

- `src/lib/scores.test.ts` covers missing/blank names (`Anonymous`) plus long
  and special-character names round-tripping through local storage as text.
- The browser-level normal-name save and replay path is covered by
  `tests/local-score-replay.spec.ts` under Risk #3; no duplicate E2E is needed
  for the isolated Risk #4 normalization contract.

### 6.5 Per-rollout-phase notes

- TBD — patterns are recorded here when each rollout phase ships.

## 7. What We Deliberately Don't Test

- **Procedural sound** — exclude implementation-level sound behavior. Re-evaluate if it becomes required for gameplay. (Source: Phase 2 interview Q5.)
- **Generated SVGs** — generated assets are not a behavior-testing target. Re-evaluate if asset generation becomes custom product logic. (Source: Phase 2 interview Q5.)
- **Fonts and colors** — exclude decorative styling from this rollout. Re-evaluate if an accessibility or brand requirement makes it functional. (Source: Phase 2 interview Q5.)

## 8. Freshness Ledger

- Strategy (§1–§5) last reviewed: 2026-09-01
- Stack versions last verified: 2026-09-01
- AI-native tool references last verified: 2026-09-01

Refresh (`/10x-test-plan --refresh`) when:

- a new top-3 risk surfaces from the roadmap or archive,
- a recommended tool's `checked:` date is older than three months,
- the project's tech stack changes (new framework, new test runner),
- §7 negative-space no longer matches what the team believes.
