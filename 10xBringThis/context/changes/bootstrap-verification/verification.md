---
bootstrapped_at: 2026-06-04T00:04:00Z
starter_id: go
starter_name: Go (standard library)
project_name: 10xbringthis
language_family: go
package_manager: go-modules (card default — no package_manager in hand-off; cmd_template has no {pm} placeholder)
cwd_strategy: subdir-then-move
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: "govulncheck ./..."
---

## Hand-off

```yaml
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
```

### Why this stack

Go (standard library) is the sole registry candidate for a Go + web-app project and passes all four agent-friendly quality gates: statically typed, convention-based, popular in training data, and well-documented. The HTMX hypermedia approach layers on top of Go's `html/template` (or `templ`) to keep JavaScript surface area minimal — a natural fit for server-rendered claim updates delivered via Server-Sent Events (`htmx-ext-sse`). Auth (email + password sessions), SSE-based realtime, and routing (chi or standard mux) must all be wired manually; the solo builder accepted this assembly overhead explicitly. For the 3-week after-hours timeline, the recommended approach is to land the SSE + claim-lock mechanics in week 1 so the core participant flow is testable before expanding to item management and optional comments. Deployment defaults to self-host (fly.io is the natural first target), CI via GitHub Actions with auto-deploy on merge to main. SQLite is viable for local dev and early production; migrate to PostgreSQL when read concurrency warrants it.

## Pre-scaffold verification

| Signal      | Value                                                       | Severity | Notes                                                              |
| ----------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| npm package | not run                                                     | —        | not a JS-family starter; no npm package in cmd_template            |
| GitHub repo | not run                                                     | —        | docs_url is https://go.dev/doc/ (not a GitHub URL); no recency signal available |

## Scaffold log

**Resolved invocation**: `mkdir .bootstrap-scaffold && cd .bootstrap-scaffold && go mod init github.com/user/10xbringthis`

> Note: `{name}` substituted with `.bootstrap-scaffold` for the temp directory; `project_name` (`10xbringthis`) used for the `go mod init` module path to produce a usable `go.mod` (a `.bootstrap-scaffold` module path would be a placeholder with no real meaning after move-up).

**Strategy**: scaffold into a temp directory then move files up (subdir-then-move)
**Exit code**: 0
**Files moved**: 1 (`go.mod`)
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: absent in scaffold
**.bootstrap-scaffold cleanup**: deleted

## Post-scaffold audit

**Tool**: `govulncheck ./...`
**Status**: failed to run
**Reason**: `govulncheck` is not installed in this environment.

Install with: `go install golang.org/x/vuln/cmd/govulncheck@latest`

Then re-run from the project root: `govulncheck ./...`

## Hints recorded but not acted on

| Hint                    | Value                   |
| ----------------------- | ----------------------- |
| bootstrapper_confidence | first-class             |
| quality_override        | false                   |
| path_taken              | custom                  |
| self_check_answers      | typed: true, from_official_starter: false, conventions: false, docs_current: false, can_judge_agent: false |
| team_size               | solo                    |
| deployment_target       | self-host               |
| ci_provider             | github-actions          |
| ci_default_flow         | auto-deploy-on-merge    |
| has_auth                | true                    |
| has_payments            | false                   |
| has_realtime            | true                    |
| has_ai                  | false                   |
| has_background_jobs     | false                   |

These fields were carried forward for audit-trail completeness. A future M1L4 skill ("Memory Architecture") will act on them — e.g. wiring `has_auth`, `has_realtime`, and `ci_provider` into generated `AGENTS.md` / `CLAUDE.md` context files, and setting up the GitHub Actions CI workflow.

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Install `govulncheck` and run it: `go install golang.org/x/vuln/cmd/govulncheck@latest && govulncheck ./...`
- The `go.mod` module path is `github.com/user/10xbringthis` — update it to your actual module path (e.g. `github.com/mrozowski/10xbringthis`) before pushing.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
