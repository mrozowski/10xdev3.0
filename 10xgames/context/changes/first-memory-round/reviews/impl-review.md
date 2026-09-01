<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Memory Cards First Full Round Flow

- **Plan**: context/changes/first-memory-round/plan.md
- **Scope**: Phases 1-5 of 5
- **Date**: 2026-09-01
- **Verdict**: REJECTED
- **Findings**: 1 critical, 3 warnings, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | FAIL |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | FAIL |

## Automated Verification

All commands recorded for the five completed phases passed:

- `npm run test -- src/lib/memory-game/engine.test.ts`: 19 tests passed.
- `npm run test -- src/lib/sound.test.ts`: 4 tests passed.
- `npm run test -- src/lib/memory-game/themes.test.ts`: 3 tests passed.
- Every recorded `npm run astro -- check`: 0 errors, warnings, or hints.
- Both recorded `npm run test` runs: 43 tests passed across 6 files.
- `npm run build`: static production build completed successfully.

## Findings

### F1 — Browser-local high scores never render or refresh

- **Severity**: ❌ CRITICAL
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: src/pages/index.astro:4-6,31-42; src/components/game/MemoryGame.astro:282-284
- **Detail**: `getScores()` executes in Astro frontmatter during the static build, where `localStorage` is unavailable, so the generated page permanently contains the empty-score state. Completing a round calls `addScore`, but no client-side code repopulates `#high-scores-list`. The checked Phase 5 criterion that a completed round updates the high-score list therefore cannot pass in the deployed static site.
- **Fix**: Render scores from a client-side function after page load and invoke the same function after a completed round, using a small custom event or shared client helper to connect the isolated game island to the catalogue panel.
  - Strength: Restores both initial browser-local score display and live updates while preserving the static architecture and game isolation.
  - Tradeoff: Adds a small client-side integration contract between the game and landing page.
  - Confidence: HIGH — the static build output cannot access visitor `localStorage`, and the current completion path emits no UI update.
  - Blind spot: Browser-level behavior should be manually rechecked after the integration is added.
- **Decision**: FIXED

### F2 — Planned catalogue launcher was replaced by an always-on game

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Plan Adherence
- **Location**: src/pages/index.astro:18-25
- **Detail**: Phase 5 requires a catalogue grid, a Memory Cards "Click to Play" entry, and a launcher/modal container. The page instead renders `MemoryGame` immediately beneath a static heading, with no catalogue card or launch interaction. This is a coherent instant-play design, but it materially differs from the reviewed landing-page contract.
- **Fix A ⭐ Recommended**: Implement the planned catalogue card and explicit game-launch view.
  - Strength: Matches the plan and product requirement for a landing-page game catalogue and establishes the extension point for future games.
  - Tradeoff: Adds view state and one interaction before gameplay begins.
  - Confidence: HIGH — the expected launcher and catalogue are explicit in Phase 5 and the repository product guidance.
  - Blind spot: The preferred exact transition and back-to-catalogue UX are not specified.
- **Fix B**: Keep instant play and document it as an intentional plan addendum.
  - Strength: Preserves the simplest one-game MVP and current zero-click start.
  - Tradeoff: Defers the catalogue architecture and changes the agreed UX contract.
  - Confidence: MEDIUM — instant play aligns with a performance goal but conflicts with explicit catalogue requirements.
  - Blind spot: Product acceptance of removing the catalogue step has not been recorded.
- **Decision**: FIXED via Fix B — deferred to roadmap slice S-05 (`game-catalogue-launcher`)

### F3 — Theme registry export does not match the planned contract

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/memory-game/themes.ts:20
- **Detail**: Phase 3 specifies the public export `DEV_THEME_SYMBOLS`, but the implementation exports `SOFTWARE_DEV_SYMBOLS`. Current internal behavior works, yet consumers written against the reviewed contract cannot import the promised symbol.
- **Fix**: Rename the export to `DEV_THEME_SYMBOLS` and update its internal references, or add a compatible alias if the current name must remain public.
- **Decision**: FIXED

### F4 — Displayed victory metadata duplicates engine constants

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/game/MemoryGame.astro:339-342
- **Detail**: The victory message hardcodes 8 pairs and computes the displayed time bonus with `roundSecondsRemaining * 10`, independently of `state.totalPairs` and the engine's `TIME_BONUS_PER_SECOND`. A future engine tuning would make the modal disagree with the score that was actually calculated and saved.
- **Fix**: Build the message from `state.totalPairs` and import `TIME_BONUS_PER_SECOND` for the displayed bonus.
- **Decision**: FIXED

### F5 — Phase 4 manual evidence predates the card-style fix

- **Severity**: 🔍 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: context/changes/first-memory-round/plan.md:351-354
- **Detail**: The Phase 4 visual criteria are marked complete at `af36eff`, but the later `3e54ec1` fix changed card styles from Astro-scoped rules to global namespaced rules because runtime-created card elements did not receive Astro scope attributes. The current implementation contains the required 3D rules, but the cited manual evidence does not substantiate the behavior of the final code.
- **Fix**: Re-run the Phase 4 visual checks against the current build and record the replacement evidence in the review follow-up without rewriting the immutable Progress step titles.
  - Strength: Establishes evidence for the final implementation rather than the known-broken intermediate commit.
  - Tradeoff: Requires browser testing on representative desktop and mobile viewports.
  - Confidence: HIGH — the follow-up commit directly changes the styling mechanism needed by runtime-created cards.
  - Blind spot: No frame-time trace or browser recording is currently retained.
- **Decision**: SKIPPED
