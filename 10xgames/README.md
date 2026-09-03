# 10x Games

Retro browser-game collection built with Astro. The app runs fully on the client: no backend, no accounts, no cloud sync. Scores and stats are stored locally in the browser.

## Stack

- JavaScript + TypeScript
- Astro 7
- Vitest for unit/integration tests
- Playwright for end-to-end checks
- Matter.js for physics
- GitHub Pages: auto-deployment on push to master branch after pipeline with test passes.

## Project tree

```text
10xgames/
├── src/
│   ├── components/game/
│   │   ├── MemoryGame.astro
│   │   └── FruitRushGame.astro
│   ├── lib/
│   │   ├── scores.ts          # read/write/rename/delete local scores
│   │   ├── stats.ts           # read/write/clear local game stats
│   │   ├── storage.ts         # safe browser storage wrappers
│   │   ├── catalog.ts         # catalogue entry metadata
│   │   ├── memory-game/       # Memory Cards logic/tests
│   │   └── fruit-rush/        # Fruit Rush engine, adapters, tests
│   ├── layouts/Layout.astro
│   ├── pages/index.astro      # game catalogue + launcher shell
│   └── assets/
├── tests/
│   ├── smoke.spec.ts
│   ├── seed.spec.ts
│   ├── game-load-and-start.spec.ts
│   ├── local-score-replay.spec.ts
│   ├── local-score-stats-crud.spec.ts
│   └── helpers/
├── public/
├── context/                   # Agentic AI folder with documentations about project, plans, changes
├── astro.config.mjs
├── package.json
├── AGENTS.md
├── README.md
└── .github/                   # Skills, prompts, hooks
```

## Requirements

- Node.js `>= 22.12.0`
- npm

Install:

```bash
npm install
```

## Run locally

```bash
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:4321/10xdev3.0/
```

Production build:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

## Score and stats CRUD

The project stores per-game scores and browser-local statistics in `src/lib/scores.ts` and `src/lib/stats.ts`.

- Read: `getScoresForGame()`, `getStats()`, `getGameStats()`
- Write: `addScore()`, `recordGameOpened()`, `recordGameTime()`, `recordCompletedGame()`
- Edit: `renameScore()`
- Delete: `deleteScore()`, `clearScoresForGame()`, `clearStats()`

This is intentionally device-local and does not require a backend or user accounts.

## Tests

### Unit and integration

```bash
npm test
```

Single file example:

```bash
npm run test -- src/lib/scores.test.ts
npm run test -- src/lib/stats.test.ts
```

### End-to-end (Playwright)

Start the app first:

```bash
npm run dev -- --host 127.0.0.1
```

Then run:

```bash
npx playwright test --reporter=line
```

Single smoke check:

```bash
npx playwright test tests/smoke.spec.ts --reporter=line
```

## Useful checks

```bash
npm run lint
npm run typecheck
```
