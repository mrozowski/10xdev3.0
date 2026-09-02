# 10x Games: Repository Guidelines

## Product and architecture

- This is an Astro 7 static site for a retro browser-game collection, deployed to GitHub Pages. See @README.md for the standard Astro project layout. The current `index.astro` and `Welcome.astro` are unmodified Astro starter content and should be replaced as the game site is implemented.
- The MVP is the landing-page game catalogue plus one complete Memory Cards game. Keep each game isolated so future games can be added without restructuring the existing game.
- Keep game interaction in client-side Astro islands. Game state, optional player names, and high scores are device-local (browser storage); the MVP has no backend, database, accounts, cloud synchronization, ads, analytics, or player-data collection.
- Themes determine the Memory Cards images. Add supplied visual and audio assets without coupling asset changes to game logic. The game must support phones, tablets, and desktop devices while keeping the initial page load within the PRD’s two-second target on a normal connection; avoid hydrating catalogue-only UI and load game assets only when needed.
- Treat `context/foundation/prd.md` as the product source of truth. It defines the gameplay, score, privacy, performance, and MVP scope requirements. `context/foundation/tech-stack.md` records the Astro and GitHub Pages deployment choice.

## Commands

Use Node.js `>=22.12.0` and npm.

List of commands can be found at @README.md, including how to run unit tests (Vitest) and E2E tests (Playwright).

Lint (`npm run lint`) and typecheck (`npm run typecheck`) scripts are configured; see `.github/hooks/per-edit-lint.json` and `.husky/pre-commit` for when they run automatically.

## Repository conventions

- Preserve Astro's static-output model. Configure `site` and any required `base` path in `astro.config.mjs` as part of GitHub Pages deployment work.
- Foundation documents under `context/foundation/` are living documents: update them in place when product decisions change. Change-scoped planning belongs in `context/changes/<change-id>/`; do not modify `context/archive/`, which is immutable by convention.
- `CLAUDE.md` is a symlink to this file. Keep project-specific agent guidance here and avoid duplicating it across agent configuration files.
- Astro scopes `<style>` blocks per-component by default. When a CSS rule must reach markup rendered outside the component's own template (slots, dynamically injected markup, shared/child markup), use `:global()` or a global stylesheet — plain scoped styles will not apply.

## E2E Testing Rules

- Model every new Playwright spec on `tests/seed.spec.ts` — same locator style, `test.step` structure, and cleanup pattern.
- Use `getByRole`, `getByLabel`, `getByText` as primary locators. Fall back to `getByTestId` only when accessibility attributes are ambiguous. Never use CSS selectors, XPath, or DOM structure.
- Each test must be independently runnable — no shared state between tests.
- Never use `page.waitForTimeout()`. Wait for specific conditions: `toBeVisible()`, `waitForURL()`, `waitForResponse()`.
- Assert the business outcome, not implementation details.
- Use unique identifiers (e.g., timestamp suffix) for test data to avoid collisions in parallel runs. Clean up in `afterEach` (see `clearTestStorage` in `tests/helpers/test-utils.ts`).
- One test per file in `tests/`, named for the risk it protects (see `context/foundation/test-plan.md`), not `test('test 1', ...)`.
