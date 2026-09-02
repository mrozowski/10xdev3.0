# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run test`            | Run all unit/integration tests once (Vitest)     |
| `npm run test:watch`      | Run unit/integration tests in watch mode         |

## 🧪 Unit & integration tests

Unit and integration tests use [Vitest](https://vitest.dev) with `jsdom` and live alongside the code they cover (e.g. `src/lib/*.test.ts`).

- Run the full suite once: `npm run test`
- Run in watch mode while developing: `npm run test:watch`
- Run a single file: `npm run test -- src/lib/scores.test.ts`
- Run tests matching a name: `npm run test -- -t "score summary"`

## 🎭 End-to-end (E2E) tests

E2E tests use [Playwright](https://playwright.dev) and live in `tests/` (see `tests/seed.spec.ts` for the reference pattern all new specs should follow).

1. Start the app so Playwright has something to drive: `npm run dev -- --host 127.0.0.1`
2. In another terminal, run the tests against `http://127.0.0.1:4321/10xdev3.0/`:
   - Full suite: `npx playwright test --reporter=line`
   - A single spec: `npx playwright test tests/smoke.spec.ts --reporter=line`
   - Playwright UI mode (debugging): `npx playwright test --ui`

## 🔧 Local quality hooks

The repository includes two lightweight quality gates for local development:

- `.husky/pre-commit` runs `git diff --cached --check` and `npm run lint` before a commit.
- `.github/hooks/per-edit-lint.json` configures Copilot hooks so `npm run lint` runs after agent edits and `npm run typecheck` runs before tool use.

These checks are intentionally scoped to staged or edited files to stay fast.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
