---
starter_id: go
project_name: 10xcards
hints:
  language_family: go
  team_size: solo
  deployment_target: self-host
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: first-class
  path_taken: standard
  quality_override: false
  self_check_answers: null
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: true
  has_background_jobs: false
---

## Why this stack

A solo developer building a flashcard web app with email+password auth and AI-powered card generation in 3 after-hours weeks. `go` is the recommended default for `(web, go)` and clears all four agent-friendly quality gates — statically typed, convention-based module layout, popular in Go training data, and well-documented at go.dev. Go's standard library handles HTTP and routing without external dependencies; auth will be wired as JWT middleware and AI card generation will call an external LLM API from a standard HTTP handler — both idiomatic patterns with a wealth of reference material. Single-binary deployment to self-host matches the low-QPS, small-data-volume PRD target with minimal ops overhead (Oracle Cloud Always Free or a similar zero-cost VPS is the natural target). Package manager is omitted because Go modules are the built-in toolchain with no external choice to record. CI runs on GitHub Actions with auto-deploy on merge, keeping the feedback loop tight for a solo after-hours project.
