# 10x Games: Copilot Instructions

## Product and architecture

- This is an Astro 7 static site for a retro browser-game collection, deployed to GitHub Pages. `src/pages/` supplies file-based routes, `src/layouts/` owns the shared document shell, and `src/components/` contains page-level UI. The current `index.astro` and `Welcome.astro` are unmodified Astro starter content and should be replaced as the game site is implemented.
- The MVP is the landing-page game catalogue plus one complete Memory Cards game. Keep each game isolated so future games can be added without restructuring the existing game.
- Keep game interaction in client-side Astro islands. Game state, optional player names, and high scores are device-local (browser storage); the MVP has no backend, database, accounts, cloud synchronization, ads, analytics, or player-data collection.
- Themes determine the Memory Cards images. Add supplied visual and audio assets without coupling asset changes to game logic. The game must support phones, tablets, and desktop devices while keeping the initial page load lightweight.
- Treat `context/foundation/prd.md` as the product source of truth. It defines the gameplay, score, privacy, performance, and MVP scope requirements. `context/foundation/tech-stack.md` records the Astro and GitHub Pages deployment choice.

## Commands

Use Node.js `>=22.12.0` and npm.

| Purpose | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Run the development server | `npm run dev` |
| Production build | `npm run build` |
| Preview a production build | `npm run preview` |
| Run Astro CLI checks or commands | `npm run astro -- check` |

No test runner, single-test command, linter, or lint script is configured yet.

## Local quality hooks

- `.husky/pre-commit` runs `git diff --cached --check` and `npm run lint` before a commit.
- `.github/hooks/per-edit-lint.json` configures Copilot hooks so `npm run lint` runs after agent edits and `npm run typecheck` runs before tool use.
- The staged-file wrapper in `10xgames/scripts/check-staged.mjs` keeps these checks fast by targeting staged files instead of the whole project.

## Repository conventions

- Preserve Astro's static-output model. Configure `site` and any required `base` path in `astro.config.mjs` as part of GitHub Pages deployment work.
- Foundation documents under `context/foundation/` are living documents: update them in place when product decisions change. Change-scoped planning belongs in `context/changes/<change-id>/`; do not modify `context/archive/`, which is immutable by convention.
- The current `.github/copilot-instructions.md` also retains the repository's installed 10x workflow guidance below. Follow its scoped-document and archived-change rules when invoking its skills.

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 3, Lesson 4 (E2E Tests)

**For E2E tests, use the `/10x-e2e` skill.** It is the single source of truth
for the workflow — risk → seed test + rules → generate → review against the five
anti-patterns → re-prompt → verify. The skill's `references/` carry the full
rules, anti-patterns, seed pattern, and prompt-template.

A few hard rules that hold even before you invoke the skill:

- **Locators:** `getByRole` / `getByLabel` / `getByText` first; `getByTestId`
  only when accessibility attributes are ambiguous. Never CSS selectors, XPath,
  or DOM structure.
- **Never `page.waitForTimeout()`.** Wait for state: `toBeVisible()`,
  `waitForURL()`, `waitForResponse()`.
- **Test independence + cleanup.** Each test runs standalone — its own setup,
  action, assertion, and cleanup; unique ids (timestamp suffix) so parallel runs
  and re-runs don't collide.

Two boundaries to keep straight:

- **DOM (snapshot) is the default.** Vision (`--caps=vision`) is a supplement for
  visual-only risks (layout, z-index, animation); for pixel regression prefer
  deterministic tools (`toMatchSnapshot`, Argos, Lost Pixel). VLM model
  selection/cost is a debugging topic (Lesson 5), not testing.
- **Healer helps on selectors, harms on logic.** A changed selector → healer
  re-finds it (route through PR review). A changed business behavior → healer
  masks the bug; that failing-test-to-fix case is Lesson 5.

<!-- END @przeprogramowani/10x-cli -->
