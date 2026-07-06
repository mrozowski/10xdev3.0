# Auth session scaffold implementation plan

## Overview

Implement the F-01 foundation: host email+password registration, login, and logout with server-side sessions. This plan creates the minimal secure auth baseline needed to unblock S-01 without expanding into account-management features.

## Current State Analysis

The repository is at scaffold stage: only `app/cmd/main.go` exists and it logs a message. There is no HTTP server, no routes, no storage, no auth code, and no tests. F-01 in roadmap is marked ready and explicitly defines session-based host auth as prerequisite for host event setup.

## Desired End State

A running Go web app exposes auth pages and handlers for host registration/login/logout, persists users and sessions in SQLite, sets secure session cookies, and enforces host-only access on protected routes. Core auth behavior is covered by unit tests plus HTTP smoke verification.

### Key Discoveries:

- Current app entrypoint is stub-only (`app/cmd/main.go:1`).
- F-01 requires host email+password session auth and unlocks S-01 (`context/foundation/roadmap.md`).
- PRD access model requires authenticated host + anonymous participants via event link (`context/foundation/prd.md`).
- Stack docs allow first-time wiring of `net/http` + `html/template` and manual session/auth implementation (`context/foundation/tech-stack.md`).

## What We're NOT Doing

- Password reset, email verification, remember-me, role model, or admin flows.
- Participant authentication (participants remain link + nickname based).
- Rate limiting, CSRF tokens, and account lockout policy in this change (tracked as follow-up hardening).
- Event/item domain logic (belongs to S-01 and later slices).

## Implementation Approach

Use stdlib-first HTTP (`net/http.ServeMux`) and SSR auth forms via `html/template`, backed by SQLite for `users` and `sessions`. Implement password hashing with `golang.org/x/crypto/bcrypt`, fixed session TTL (24h), and server-side session lookup per request. Keep package boundaries explicit (`auth`, `sessions`, `storage`, `http`) so S-01 can extend without rewrites.

## Critical Implementation Details

Sequence matters: establish persistent storage and schema before wiring handlers so registration/login behavior is built against real persistence, not temporary in-memory contracts. Session cookies must always be `HttpOnly` + `SameSite`; `Secure` should be environment-aware (`true` in production) to avoid local-dev lockout while preserving production security defaults.

## Phase 1: Runtime and auth data foundation

### Overview

Create the executable HTTP baseline and persistent auth/session storage contracts so later phases can implement flows directly on stable infrastructure.

### Changes Required:

#### 1. HTTP runtime bootstrap

**File**: `app/cmd/main.go`

**Intent**: Replace the stub logger entrypoint with app bootstrap that opens storage, builds the router, and starts an HTTP server.

**Contract**: `main()` must initialize dependencies in deterministic order (config -> storage -> routes -> server listen) and fail fast on startup errors.

#### 2. SQLite connection and schema initialization

**File**: `app/internal/storage/sqlite/db.go`

**Intent**: Introduce SQLite open/close helpers and startup schema application for auth-related tables.

**Contract**: Expose constructor-style API returning `*sql.DB` configured for app use; startup must ensure `users` and `sessions` tables exist before handlers run.

#### 3. Auth schema baseline

**File**: `app/internal/storage/sqlite/migrations/001_auth.sql`

**Intent**: Define foundational tables and constraints for host accounts and sessions.

**Contract**: `users` enforces unique email; `sessions` stores session ID, user ID, expiry, and revocation/deletion semantics needed for logout and TTL checks.

### Success Criteria:

#### Automated Verification:

- Project builds successfully: `go build ./...`
- Static analysis passes: `go vet ./...`
- Server starts with initialized schema: `go run ./app/cmd`

#### Manual Verification:

- App process boots without panic and listens on configured port
- SQLite file/tables are created on first startup and reused on restart

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Auth flows and session lifecycle

### Overview

Implement registration, login, and logout with secure password handling and fixed-TTL session lifecycle.

### Changes Required:

#### 1. Password hashing and verification

**File**: `app/internal/auth/password.go`

**Intent**: Centralize password hashing/compare behavior so handlers never manipulate raw hash internals.

**Contract**: Provide hash + verify functions using bcrypt with consistent error surfaces for invalid credentials.

#### 2. User/session repositories and service logic

**File**: `app/internal/auth/service.go`

**Intent**: Orchestrate register/login/logout rules over storage repositories.

**Contract**: Register rejects duplicate email; login creates session with fixed 24h expiry; logout invalidates current session record.

#### 3. Auth HTTP handlers

**File**: `app/internal/http/handlers/auth.go`

**Intent**: Expose SSR and POST endpoints for register/login/logout.

**Contract**: Invalid login returns generic credential error; register duplicate email returns explicit conflict-style feedback; successful login sets session cookie tied to server-side session ID.

### Success Criteria:

#### Automated Verification:

- Auth package tests pass: `go test ./...`
- Auth routes compile and link into app runtime: `go build ./...`
- Logout removes or invalidates active session record in tests

#### Manual Verification:

- Register -> login -> logout flow works in browser/curl with cookie jar
- Invalid credentials show generic login error; duplicate email shows explicit registration error

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Phase 3: Route protection and delivery checks

### Overview

Wire auth middleware and protected host surface placeholder, then verify guard behavior and regression-safe baseline tests.

### Changes Required:

#### 1. Session middleware and principal resolution

**File**: `app/internal/http/middleware/auth.go`

**Intent**: Resolve session cookie into authenticated host context for protected routes.

**Contract**: Middleware rejects missing/expired/invalid sessions and passes valid host identity downstream.

#### 2. Route registration and SSR auth views

**File**: `app/internal/http/routes.go`

**Intent**: Register public auth endpoints and protected host route group using middleware.

**Contract**: Public paths expose register/login; protected paths require authenticated host session; base unauthenticated route behavior remains compatible with PRD access model.

#### 3. Initial test suite for guard behavior

**File**: `app/internal/http/handlers/auth_test.go`

**Intent**: Lock critical behavior for auth flow and route guards.

**Contract**: Tests cover unauthenticated denial on protected route, successful access with valid session, and expired session rejection.

### Success Criteria:

#### Automated Verification:

- Middleware/handler tests pass: `go test ./...`
- App builds and vets cleanly after full wiring: `go build ./... && go vet ./...`
- Protected route returns 401/redirect when session is absent or expired

#### Manual Verification:

- Host can access protected page after login and loses access immediately after logout
- Anonymous user can reach public auth pages but not protected host surface

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Testing Strategy

### Unit Tests:

- Password hashing/verification (success, mismatch, malformed hash)
- Register/login/logout service rules and session TTL semantics
- Middleware session validation (missing, invalid, expired, valid)

### Integration Tests:

- Register -> login -> protected route access -> logout flow via HTTP test server
- Duplicate registration and invalid login response behavior

### Manual Testing Steps:

1. Start app and open register/login pages in browser.
2. Register new host, log in, and confirm protected route access.
3. Log out and confirm protected route is blocked with same cookie jar.
4. Retry registration with same email and confirm duplicate handling.

## Performance Considerations

Auth operations are low-volume for MVP, but each request should remain O(1) against indexed session/user lookups. Keep synchronous DB operations short and avoid per-request schema checks after startup.

## Migration Notes

Create auth schema as migration `001_auth.sql` and apply on startup for now. Subsequent slices should add incremental migrations (not rewrite baseline tables) so data survives between roadmap steps.

## References

- Change record: `context/changes/auth-session-scaffold/change.md`
- Roadmap source: `context/foundation/roadmap.md`
- Product requirements: `context/foundation/prd.md`
- Stack constraints: `context/foundation/tech-stack.md`
- Progress contract: `.github/skills/10x-plan/references/progress-format.md`
- Current code baseline: `app/cmd/main.go`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Runtime and auth data foundation

#### Automated

- [ ] 1.1 Project builds successfully: `go build ./...`
- [ ] 1.2 Static analysis passes: `go vet ./...`
- [ ] 1.3 Server starts with initialized schema: `go run ./app/cmd`

#### Manual

- [ ] 1.4 App process boots without panic and listens on configured port
- [ ] 1.5 SQLite file/tables are created on first startup and reused on restart

### Phase 2: Auth flows and session lifecycle

#### Automated

- [ ] 2.1 Auth package tests pass: `go test ./...`
- [ ] 2.2 Auth routes compile and link into app runtime: `go build ./...`
- [ ] 2.3 Logout removes or invalidates active session record in tests

#### Manual

- [ ] 2.4 Register -> login -> logout flow works in browser/curl with cookie jar
- [ ] 2.5 Invalid credentials show generic login error; duplicate email shows explicit registration error

### Phase 3: Route protection and delivery checks

#### Automated

- [ ] 3.1 Middleware/handler tests pass: `go test ./...`
- [ ] 3.2 App builds and vets cleanly after full wiring: `go build ./... && go vet ./...`
- [ ] 3.3 Protected route returns 401/redirect when session is absent or expired

#### Manual

- [ ] 3.4 Host can access protected page after login and loses access immediately after logout
- [ ] 3.5 Anonymous user can reach public auth pages but not protected host surface
