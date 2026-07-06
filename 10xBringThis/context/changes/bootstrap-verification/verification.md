---
bootstrapped_at: 2026-07-06T17:30:10Z
starter_id: go
starter_name: "Go (standard library)"
project_name: 10xbringthis
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

| Signal      | Value                              | Severity | Notes                                                          |
| ----------- | ----------------------------------- | -------- | --------------------------------------------------------------- |
| npm package | not run                             | n/a      | `hints.language_family` is `go`, not `js` — no npm CLI involved |
| GitHub repo | not run                             | n/a      | card `docs_url` is `https://go.dev/doc/`, not a GitHub repo URL |

No recency signal available for this starter card. Proceeding (this slot is educational only; it never gates the scaffold).

## Scaffold log

**Resolved invocation**: `mkdir .bootstrap-scaffold && cd .bootstrap-scaffold && go mod init github.com/user/.bootstrap-scaffold`
**Strategy**: subdir-then-move
**Exit code**: 0
**Files moved**: 0 (1 file produced by the CLI; conflict policy sidelined it — see below)
**Conflicts (.scaffold siblings)**: go.mod.scaffold
**.gitignore handling**: absent in scaffold
**.bootstrap-scaffold cleanup**: deleted

Notes: cwd already carried a scaffold-shaped fingerprint (`go.mod`, plus an existing `app/cmd/main.go`) from prior work, confirmed via the populated-cwd guard before this step ran. The existing `go.mod` (module `github.com/mrozowski/10xbringthis`) won per the conflict matrix; the CLI's freshly generated `go.mod` (module `github.com/user/.bootstrap-scaffold`) was sidelined as `go.mod.scaffold` for inspection/diff. No other files were produced by this starter's minimal `cmd_template`.

## Post-scaffold audit

**Tool**: `govulncheck -json ./...`
**Summary**: 0 CRITICAL, 0 HIGH, 1 MODERATE, 45 LOW
**Direct vs transitive**: not distinguished by this tool in the classic sense — all 46 findings are against the Go 1.23.4 standard library (no third-party dependencies exist in this module yet); 1 finding has a confirmed call trace into project code (via `os`/`log` package initialization reached from `app/cmd/main.go`), the remaining 45 are import-level stdlib advisories without a full traced call chain to project code.

#### CRITICAL findings

None.

#### HIGH findings

None.

#### MODERATE findings

- **GO-2025-3750** (aliases: CVE-2025-0913) — "Inconsistent handling of O_CREATE|O_EXCL on Unix and Windows in os in syscall". Affects Go stdlib < 1.23.10 (and < 1.24.4 on the 1.24 branch). Confirmed call trace through `os`/`syscall` package initialization reached from `app/cmd/main.go`. Windows-specific symlink/dangling-path behavior; not exploitable via this project's current Linux-targeted deployment default, but toolchain upgrade is the fix. Fixed in Go 1.23.10.

#### LOW / INFO findings

45 additional Go standard-library advisories (`GO-2021-*` through `GO-2026-*`, e.g. GO-2025-3373, GO-2025-3420, GO-2025-3447, GO-2025-3503, GO-2025-3563, GO-2025-4008 through GO-2026-5039) affecting packages such as `crypto/tls`, `net/http`, `net/url`, `crypto/x509`, `archive/zip`, `archive/tar`, `encoding/pem`, `net/mail`, and `html/template`, all fixed in Go patch releases newer than the toolchain currently pinned in `go.mod` (`go 1.23.4`). None showed a confirmed call trace into project code at scan time — govulncheck reported them as present in the imported stdlib surface without a traced reachable path. Full raw JSON output is not persisted alongside this log; re-run `govulncheck -json ./...` from the project root for the complete machine-readable list. Recommended action: bump the toolchain directive in `go.mod` to a current Go 1.23.x (or 1.24.x) patch release to clear the majority of these in one step.

## Hints recorded but not acted on

| Hint                     | Value                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| bootstrapper_confidence  | first-class                                                                               |
| quality_override         | false                                                                                     |
| path_taken               | custom                                                                                    |
| self_check_answers       | typed: true, from_official_starter: false, conventions: false, docs_current: false, can_judge_agent: false |
| team_size                | solo                                                                                      |
| deployment_target        | self-host                                                                                 |
| ci_provider              | github-actions                                                                            |
| ci_default_flow          | auto-deploy-on-merge                                                                      |
| has_auth                 | true                                                                                      |
| has_payments             | false                                                                                     |
| has_realtime             | true                                                                                      |
| has_ai                   | false                                                                                     |
| has_background_jobs      | false                                                                                     |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review `go.mod.scaffold` (the CLI's freshly generated stub) and delete it once confirmed unneeded — your existing `go.mod` was preserved.
- Bump the Go toolchain directive in `go.mod` past 1.23.10 to clear the bulk of the stdlib advisories listed above.
- Address the remaining audit findings per your project's risk tolerance — the full breakdown is in this log.
