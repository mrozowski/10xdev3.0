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

## Why this stack

A solo developer is shipping a static, backend-free retro game site (Memory Cards first, more games later) in three after-hours weeks, explicitly ruling out accounts, a database, and any server. The vetted recommended default for `(web, js)`, 10x Astro Starter, bundles Supabase auth/database — unused overhead against the PRD's non-goals — so the custom path was chosen instead. Astro was picked over heavier full-stack frameworks (Next, Nuxt, React Router, T3, Angular — all filtered out per an explicit "avoid big frameworks / no backend" preference) and over Svelte (smaller AI-training footprint, higher agent-assistance friction) and Vite+React (fails the convention-based quality gate). Astro ships zero JS by default and hydrates only the interactive game as an island — plain JS/TS or a lightweight canvas library like p5.js per game — keeping the bundle small and each future game (Snake, Tetris) isolated without reworking the app. It clears all four agent-friendly gates, carries verified bootstrapper confidence, and exports static output deployable to GitHub Pages, matching the user's deployment preference. CI runs on GitHub Actions with auto-deploy-on-merge.
