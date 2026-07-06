# Repository Guidelines

10xBringThis is a mobile-first web app for coordinating "who brings what" to shared events (parties, BBQs, trips), replacing ad-hoc chat coordination. Stack: Go (standard library only, no framework), module `github.com/mrozowski/10xbringthis`, `go 1.23.4`.

## Current state (read before assuming structure)

The project is freshly scaffolded: `app/cmd/main.go` is a stub (`log.Println` only), with no HTTP routes, no dependencies beyond stdlib, no tests, no lint config, and no CI workflow yet. Do not assume patterns exist elsewhere — check first. Per @context/foundation/tech-stack.md, the planned approach layers HTMX + `html/template` (or `templ`) for server-rendered UI, SSE (`htmx-ext-sse`) for realtime claim updates, and `chi` or stdlib `net/http.ServeMux` for routing — none are wired in yet, so introducing them is a first-time decision, not an existing convention.

## Security & Configuration Tips

- Auth is planned as email/password sessions and is not yet implemented — do not assume an existing auth middleware or session store.
- Guest (non-host) participants access events via link + nickname without login; keep this distinction in mind when adding auth to host-only flows (event creation, item management).

## Project Structure & Module Organization

- `app/cmd/main.go` — application entry point.
- `context/foundation/prd.md` — product requirements (Polish-language MVP spec: event creation, item claim/unclaim, guest access via link + nickname, realtime updates).
- `context/foundation/tech-stack.md` — stack rationale and hints (auth: sessions; realtime: SSE; DB: SQLite for dev, PostgreSQL migration path).
- `context/changes/` — per-change verification logs; `context/archive/` is immutable — never write there (open a new change instead).

## Build, Test, and Development Commands

- `go build ./...` — build all packages.
- `go run ./app/cmd` — run the entry point locally.
- `go vet ./...` — static checks; run before committing once code beyond the stub exists.
- `govulncheck ./...` — vulnerability scan; the pinned `go 1.23.4` toolchain has known stdlib advisories, prefer bumping to a current 1.23.x/1.24.x patch when touching `go.mod`.
- No test suite, linter, or CI workflow exists yet — add `go test ./...` coverage as packages are created.

## Coding Style & Naming Conventions

- Standard Go formatting: run `gofmt`/`go vet` on changed files; no custom linter is configured.
- Package layout follows Go convention (`cmd/` for entry points); place new packages under `app/` alongside `cmd/`.

## Commit & Pull Request Guidelines

- Recent commit history has no enforced prefix convention (e.g. `Add 10xBringThis project`, `update verification.md`); use short, descriptive, imperative subject lines.
- No CI workflow currently gates PRs; `ci_provider: github-actions` with `ci_default_flow: auto-deploy-on-merge` is the intended target per @context/foundation/tech-stack.md but is not yet implemented.
