---
bootstrapped_at: 2026-08-31T17:49:18Z
starter_id: astro
starter_name: Astro
project_name: 10x-games
language_family: js
package_manager: npm
cwd_strategy: subdir-then-move
bootstrapper_confidence: verified
phase_3_status: ok
audit_command: "npm audit --json"
---

## Hand-off

```yaml
---
starter_id: astro
package_manager: npm
project_name: 10x-games
hints:
  language_family: js
  team_size: solo
  deployment_target: github-pages
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: verified
  path_taken: custom
  quality_override: false
  self_check_answers:
    typed: true
    from_official_starter: true
    conventions: true
    docs_current: true
    can_judge_agent: false
  has_auth: false
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---
```

## Why this stack

A solo developer is shipping a static, backend-free retro game site (Memory Cards first, more games later) in three after-hours weeks, explicitly ruling out accounts, a database, and any server. The vetted recommended default for `(web, js)`, 10x Astro Starter, bundles Supabase auth/database — unused overhead against the PRD's non-goals — so the custom path was chosen instead. Astro was picked over heavier full-stack frameworks (Next, Nuxt, React Router, T3, Angular — all filtered out per an explicit "avoid big frameworks / no backend" preference) and over Svelte (smaller AI-training footprint, higher agent-assistance friction) and Vite+React (fails the convention-based quality gate). Astro ships zero JS by default and hydrates only the interactive game as an island — plain JS/TS or a lightweight canvas library like p5.js per game — keeping the bundle small and each future game (Snake, Tetris) isolated without reworking the app. It clears all four agent-friendly gates, carries verified bootstrapper confidence, and exports static output deployable to GitHub Pages, matching the user's deployment preference. CI runs on GitHub Actions with auto-deploy-on-merge.

## Pre-scaffold verification

| Signal | Value | Severity | Notes |
| --- | --- | --- | --- |
| npm package | create-astro v5.2.4 published 2026-08-24T15:00:24.173Z | fresh | Resolved from `cmd_template`. |
| GitHub repo | not run | n/a | The card's documentation URL is not a GitHub repository. |

## Scaffold log

**Resolved invocation**: `npm create astro@latest -- .bootstrap-scaffold --template basics --install --git --yes`
**Strategy**: subdir-then-move
**Exit code**: 0
**Files moved**: 13 top-level paths
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: moved silently
**.bootstrap-scaffold cleanup**: deleted

The starter CLI installed dependencies and initialized its own Git metadata before the merge. Its `AGENTS.md` and `CLAUDE.md` files were moved as starter output; bootstrapper did not generate agent-context files.

## Post-scaffold audit

**Tool**: `npm audit --json`
**Summary**: 0 CRITICAL, 0 HIGH, 0 MODERATE, 0 LOW
**Direct vs transitive**: 0/0/0/0 direct of total 0/0/0/0

#### CRITICAL findings

None.

#### HIGH findings

None.

#### MODERATE findings

None.

#### LOW / INFO findings

None.

## Hints recorded but not acted on

| Hint | Value |
| --- | --- |
| bootstrapper_confidence | verified |
| quality_override | false |
| path_taken | custom |
| self_check_answers | `typed: true`, `from_official_starter: true`, `conventions: true`, `docs_current: true`, `can_judge_agent: false` |
| team_size | solo |
| deployment_target | github-pages |
| ci_provider | github-actions |
| ci_default_flow | auto-deploy-on-merge |
| has_auth | false |
| has_payments | false |
| has_realtime | false |
| has_ai | false |
| has_background_jobs | false |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:

- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
