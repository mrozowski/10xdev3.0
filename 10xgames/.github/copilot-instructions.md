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

## 10xDevs AI Toolkit - Module 2, Lesson 2

Turn one roadmap item into the first implementation cycle with the **change planning chain**:

```
/10x-roadmap -> /10x-new -> /10x-plan -> /10x-plan-review -> /10x-implement
```

`/10x-new`, `/10x-plan`, `/10x-plan-review`, and `/10x-implement` are the lesson focus. `/10x-frame` and `/10x-research` are not required rituals here; they are escalation paths introduced in the next lesson.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Change setup (lesson focus)** | |
| `/10x-new <change-id>` | You selected a roadmap item and need a stable change folder. Creates `context/changes/<change-id>/change.md` so planning, implementation, progress, commits, and later review all share one identity. Use AFTER roadmap selection, BEFORE `/10x-plan`. |
| **Planning (lesson focus)** | |
| `/10x-plan <change-id>` | You have a change folder and need a reviewable implementation plan. Reads roadmap context, foundation docs, codebase evidence, and any existing change notes; writes `plan.md` and `plan-brief.md` with phases, file contracts, success criteria, and `## Progress`. |
| **Plan readiness (lesson focus)** | |
| `/10x-plan-review <change-id>` | You have `plan.md` and need a light pre-code readiness check. Use it to catch missing end state, weak contracts, malformed progress, scope drift, or blind spots before code changes begin. |
| **Implementation (lesson focus)** | |
| `/10x-implement <change-id> phase <n>` | You have an approved plan and want to execute one phase with verification, manual gate, commit ritual, and SHA write-back to `## Progress`. |
| **Lifecycle closure** | |
| `/10x-archive <change-id>` | A change is merged or intentionally closed. Move it out of active `context/changes/` into archive state. |

### How the chain hands off

- `/10x-new` creates the durable change identity.
- `/10x-plan` turns that identity into an implementation contract.
- `/10x-plan-review` checks the plan before the agent mutates code.
- `/10x-implement` executes one planned phase, verifies, asks for manual confirmation when needed, commits, and records progress.

### Lesson boundaries

- Plan is the default router after roadmap selection. Start with `/10x-plan` unless the problem is unclear or external evidence is blocking.
- Do not run `/10x-frame + /10x-research` as ceremony for every change.
- Do not turn this lesson into a full end-to-end product build. A checkpoint with a planned and partially or fully implemented stream is valid.
- Code review of the implemented diff belongs to Lesson 3 via `/10x-impl-review`.
- Lifecycle closure via `/10x-archive` after a change is merged or intentionally closed.

### Paths used by this lesson

- `context/foundation/roadmap.md` - upstream roadmap
- `context/changes/<change-id>/change.md` - change identity
- `context/changes/<change-id>/plan.md` - implementation contract
- `context/changes/<change-id>/plan-brief.md` - compressed handoff
- `context/foundation/lessons.md` - recurring rules and pitfalls
- `docs/reference/contract-surfaces.md` - load-bearing names registry

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
