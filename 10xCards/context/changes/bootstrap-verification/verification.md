---
bootstrapped_at: 2026-05-25T20:15:19Z
starter_id: go
starter_name: Go (standard library)
project_name: 10xcards
language_family: go
package_manager: go-modules
cwd_strategy: subdir-then-move
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: "govulncheck -json ./..."
---

## Hand-off

```yaml
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
```

### Why this stack

A solo developer building a flashcard web app with email+password auth and AI-powered card generation in 3 after-hours weeks. `go` is the recommended default for `(web, go)` and clears all four agent-friendly quality gates — statically typed, convention-based module layout, popular in Go training data, and well-documented at go.dev. Go's standard library handles HTTP and routing without external dependencies; auth will be wired as JWT middleware and AI card generation will call an external LLM API from a standard HTTP handler — both idiomatic patterns with a wealth of reference material. Single-binary deployment to self-host matches the low-QPS, small-data-volume PRD target with minimal ops overhead (Oracle Cloud Always Free or a similar zero-cost VPS is the natural target). Package manager is omitted because Go modules are the built-in toolchain with no external choice to record. CI runs on GitHub Actions with auto-deploy on merge, keeping the feedback loop tight for a solo after-hours project.

## Pre-scaffold verification

| Signal      | Value                                              | Severity | Notes                                            |
| ----------- | -------------------------------------------------- | -------- | ------------------------------------------------ |
| npm package | not run                                            | —        | non-JS starter; no npm package in cmd_template   |
| GitHub repo | not run                                            | —        | docs_url is https://go.dev/doc/ (not a GitHub URL) |

No recency signals available for this starter. Proceeding was the correct action (WARN-AND-CONTINUE applies).

## Scaffold log

**Resolved invocation**: `mkdir .bootstrap-scaffold && cd .bootstrap-scaffold && go mod init github.com/user/10xcards`
**Strategy**: scaffold into a temp directory then move files up (subdir-then-move)
**Exit code**: 0
**Files moved**: 1 (`go.mod`)
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: absent in scaffold
**.bootstrap-scaffold cleanup**: deleted

## Post-scaffold audit

**Tool**: `govulncheck -json ./...`
**Summary**: 0 CRITICAL, 0 HIGH, 0 MODERATE, 0 LOW
**Direct vs transitive**: not applicable — no Go source packages exist yet (fresh `go mod init`; no `.go` files)
**Note**: `govulncheck` reported "no packages matched the provided patterns" — this is expected for a module with only `go.mod` and no source files. Clean tree.

## Hints recorded but not acted on

| Hint                    | Value                |
| ----------------------- | -------------------- |
| bootstrapper_confidence | first-class          |
| quality_override        | false                |
| path_taken              | standard             |
| self_check_answers      | null                 |
| team_size               | solo                 |
| deployment_target       | self-host            |
| ci_provider             | github-actions       |
| ci_default_flow         | auto-deploy-on-merge |
| has_auth                | true                 |
| has_payments            | false                |
| has_realtime            | false                |
| has_ai                  | true                 |
| has_background_jobs     | false                |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
