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

## Repository conventions

- Preserve Astro's static-output model. Configure `site` and any required `base` path in `astro.config.mjs` as part of GitHub Pages deployment work.
- Foundation documents under `context/foundation/` are living documents: update them in place when product decisions change. Change-scoped planning belongs in `context/changes/<change-id>/`; do not modify `context/archive/`, which is immutable by convention.
- The current `.github/copilot-instructions.md` also retains the repository's installed 10x workflow guidance below. Follow its scoped-document and archived-change rules when invoking its skills.

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 2, Lesson 4

Prepare for a harder implementation stream with the **research-backed planning chain**:

```
internal research (/10x-research) + external research (exa.ai, Context7) -> /10x-plan -> /10x-implement -> success
```

The lesson focus is distinguishing internal from external research and using evidence to back planning decisions.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Internal research (lesson focus)** | |
| `/10x-research <change-id>` | You need evidence from the existing codebase — patterns, conventions, integration points, or existing implementations. Runs parallel sub-agents over the repo and writes structured findings to `research.md`. |
| **External research (lesson focus)** | |
| exa.ai | You need AI-native web search for library comparisons, best practices, or ecosystem context that the codebase cannot answer. |
| Context7 (`resolve-library-id` → `get-library-docs`) | You need live, current documentation for a specific library or framework. Resolves a library ID first, then fetches relevant doc pages. |
| **Framing spare wheel** | |
| `/10x-frame <change-id>` | The plan won't converge, the plan doesn't deliver expected results, or persistent drift keeps breaking the implementation. Use as an escape hatch on a separate problem (demonstrated on Space Explorers example), not as pre-research ritual. |
| **Planning and execution** | |
| `/10x-plan <change-id>` / `/10x-implement <change-id> phase <n>` | Use the same planning and execution chain from Lesson 2, now with upstream research evidence feeding the plan. |

### Research discipline

- Internal research (`/10x-research`) answers "what does our codebase already do?" — patterns, schemas, conventions, integration points.
- External research (exa.ai, Context7) answers "what should we do?" — library capabilities, API docs, ecosystem best practices.
- Combine both as evidence-backed input to `/10x-plan`. A plan without research evidence on a non-trivial stream is a guess.
- Agent-friendly docs (`llms.txt`, markdown-for-agents, `/md` endpoints) are a quality signal for library selection — libraries that publish agent-readable docs integrate faster.

### `/10x-frame` as spare wheel

Three triggers for reaching for `/10x-frame`:
1. The plan won't converge — research keeps opening more questions instead of narrowing to a contract.
2. The plan doesn't deliver — implementation repeatedly fails to meet success criteria.
3. Persistent drift — the implementation keeps diverging from the plan in ways that suggest the problem was mis-framed.

Demonstrated on a Space Explorers example, not the SRS path. It is an escape hatch, not a mandatory step.

### Paths used by this lesson

- `context/changes/<change-id>/research.md` - internal research output
- `context/changes/<change-id>/frame.md` - framing output when needed
- `context/changes/<change-id>/plan.md` - evidence-backed implementation contract
- `context/foundation/lessons.md` - recurring rules and pitfalls

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
