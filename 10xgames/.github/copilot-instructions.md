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

## 10xDevs AI Toolkit - Module 2, Lesson 3

Review AI-generated code before merge with the **implementation review chain**:

```
/10x-implement -> /10x-impl-review -> triage -> (/10x-lesson | fix | skip | disagree)
```

`/10x-impl-review` is the lesson focus. Review is a quality gate, not an instruction to fix every finding.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Code review (lesson focus)** | |
| `/10x-impl-review <change-id>` | You have implemented code and want a structured review before merge. The skill checks plan adherence, scope discipline, safety and quality, architecture, pattern consistency, and success criteria, then presents findings for triage. |
| **Recurring lesson outcome** | |
| `/10x-lesson` | A finding reveals a recurring project rule or agent failure pattern. Record it in `context/foundation/lessons.md` instead of treating it as a one-off note. |

### Triage discipline

- Severity says how bad the finding is. Impact says how much the decision matters now.
- Valid outcomes: fix now, fix differently, skip, accept as risk, record as recurring rule (`/10x-lesson`), disagree.
- Fix critical findings. Do not burn hours on low-impact observations just because the agent found them.
- Conscious skipping of low-impact findings is a valid review outcome, not negligence.
- If you disagree with a finding, record why. Wrong agent reasoning is also signal.

### Review boundaries

- This lesson reviews implemented code. It does not create the plan, execute new phases, or teach CI review.
- Testing strategy and quality gates are introduced in Module 3.
- Do not use `/10x-contract` as a triage outcome in this lesson.

### Paths used by this lesson

- `context/changes/<change-id>/plan.md` - expected implementation contract
- `context/changes/<change-id>/reviews/` - review output
- `context/foundation/lessons.md` - recurring lessons

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
