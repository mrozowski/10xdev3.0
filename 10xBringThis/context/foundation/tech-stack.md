---
starter_id: go
project_name: 10xbringthis
hints:
  language_family: go
  team_size: solo
  deployment_target: self-host
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: first-class
  path_taken: custom
  quality_override: false
  self_check_answers:
    typed: true
    from_official_starter: false
    conventions: false
    docs_current: false
    can_judge_agent: false
  has_auth: true
  has_payments: false
  has_realtime: true
  has_ai: false
  has_background_jobs: false
---

## Why this stack

Go (standard library) is the sole registry candidate for a Go + web-app project and passes all four agent-friendly quality gates: statically typed, convention-based, popular in training data, and well-documented. The HTMX hypermedia approach layers on top of Go's `html/template` (or `templ`) to keep JavaScript surface area minimal — a natural fit for server-rendered claim updates delivered via Server-Sent Events (`htmx-ext-sse`). Auth (email + password sessions), SSE-based realtime, and routing (chi or standard mux) must all be wired manually; the solo builder accepted this assembly overhead explicitly. For the 3-week after-hours timeline, the recommended approach is to land the SSE + claim-lock mechanics in week 1 so the core participant flow is testable before expanding to item management and optional comments. Deployment defaults to self-host (fly.io is the natural first target), CI via GitHub Actions with auto-deploy on merge to main. SQLite is viable for local dev and early production; migrate to PostgreSQL when read concurrency warrants it.
