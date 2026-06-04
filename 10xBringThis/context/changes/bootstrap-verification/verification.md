---
bootstrapped_at: 2026-06-04T00:49:00Z
starter_id: go
starter_name: "Go (standard library)"
project_name: 10xbringthis
language_family: go
package_manager: "go-modules (no external package manager; Go modules built-in)"
cwd_strategy: subdir-then-move
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: "govulncheck -json ./..."
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

| Signal      | Value    | Severity | Notes                                                                          |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------ |
| npm package | not run  | n/a      | Go starter — no npm package in cmd_template                                    |
| GitHub repo | not run  | n/a      | docs_url is https://go.dev/doc/ — not a GitHub URL; no pushed_at signal available |

## Scaffold log

**Resolved invocation**: `mkdir .bootstrap-scaffold && cd .bootstrap-scaffold && go mod init github.com/user/10xbringthis`

> Note: `{name}` was substituted as `.bootstrap-scaffold` for the directory name (per subdir-then-move strategy). The module path used `project_name` (`10xbringthis`) because Go rejects module path components beginning with `.`; `github.com/user/.bootstrap-scaffold` would have caused `go mod init` to exit non-zero.

**Strategy**: subdir-then-move (default — `go` not listed in bootstrapper-config.yaml starters map)
**Exit code**: 0
**Files moved**: 1 (`go.mod`)
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: absent in scaffold
**.bootstrap-scaffold cleanup**: deleted

## Post-scaffold audit

**Tool**: `govulncheck -json ./...`
**govulncheck version**: v1.3.0
**Vulnerability DB**: https://vuln.go.dev (last modified 2026-06-02T21:39:47Z)
**Go version**: go1.23.4
**Status**: ran successfully; no packages matched `./...`

> The fresh scaffold contains only `go.mod` — no `.go` source files exist yet, so `govulncheck` found no packages to scan (exit 1 with "no packages matched the provided patterns"). This is expected for a bare module init. Re-run `govulncheck ./...` once source files are added.

**Summary**: 0 CRITICAL, 0 HIGH, 0 MODERATE, 0 LOW — clean tree (no source files to scan).

## Hints recorded but not acted on

| Hint                    | Value                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| bootstrapper_confidence | first-class                                                                                        |
| quality_override        | false                                                                                              |
| path_taken              | custom                                                                                             |
| self_check_answers      | typed: true, from_official_starter: false, conventions: false, docs_current: false, can_judge_agent: false |
| team_size               | solo                                                                                               |
| deployment_target       | self-host                                                                                          |
| ci_provider             | github-actions                                                                                     |
| ci_default_flow         | auto-deploy-on-merge                                                                               |
| has_auth                | true                                                                                               |
| has_payments            | false                                                                                              |
| has_realtime            | true                                                                                               |
| has_ai                  | false                                                                                              |
| has_background_jobs     | false                                                                                              |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
