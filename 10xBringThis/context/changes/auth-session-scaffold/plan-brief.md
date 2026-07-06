# Auth session scaffold — Plan Brief

> Full plan: `context/changes/auth-session-scaffold/plan.md`

## What & Why

This change implements the F-01 foundation: host registration, login, and logout with server-side sessions. It exists to unblock S-01 (host event setup), which depends on a logged-in host. The goal is a minimal but secure auth baseline, not a full account-management system.

## Starting Point

The codebase is currently a stub (`app/cmd/main.go`) with no HTTP server, routes, persistence, or auth code. Roadmap and PRD define auth as required for host-only flows, while participants remain anonymous via shared event links.

## Desired End State

The app runs an HTTP server with auth pages/endpoints, persists users and sessions in SQLite, and enforces host-only access on protected routes. Hosts can register, log in, and log out reliably with fixed-TTL sessions. Core auth behavior is covered by unit tests and HTTP smoke checks.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Persistence baseline | SQLite now for users + sessions | Avoids throwaway in-memory implementation and prevents rewrite pressure in S-01. |
| HTTP stack | `net/http.ServeMux` + `html/template` | Best fit for current zero-pattern codebase and keeps dependency surface minimal. |
| Password hashing | `bcrypt` (`golang.org/x/crypto/bcrypt`) | Standard, battle-tested password hashing with acceptable MVP complexity. |
| Session model | Fixed TTL (24h), no sliding refresh | Simpler behavior/debugging for first auth slice while still bounded by expiry. |
| Error strategy | Generic login failure + explicit duplicate-email on register | Balances user feedback with basic protection against account enumeration. |
| Hardening scope | Cookie flags + TTL + input limits now; CSRF/rate-limit later | Covers highest-value protections without derailing foundation delivery speed. |

## Scope

**In scope:**
- Host register/login/logout flow
- Server-side session persistence and cookie issuance
- Protected host-route middleware baseline
- Unit + smoke verification for auth-critical behavior

**Out of scope:**
- Password reset, email verification, remember-me
- Participant auth changes
- CSRF/rate limiting/lockout policy implementation
- Event/item domain functionality

## Architecture / Approach

Three-phase incremental delivery: first bootstrap runtime and SQLite auth schema, then implement auth and session lifecycle rules, then enforce protected-route middleware and verification. Package boundaries (`storage`, `auth`, `sessions`, `http`) are explicit so later slices can extend behavior without structural rewrites.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Runtime and auth data foundation | Running HTTP bootstrap + SQLite users/sessions schema | Startup/dependency ordering drift creates fragile initialization |
| 2. Auth flows and session lifecycle | Register/login/logout with bcrypt and fixed-TTL sessions | Security regressions in cookie/session handling |
| 3. Route protection and delivery checks | Middleware-enforced protected surface + regression checks | Incorrect guard boundaries blocking valid/allowing invalid access |

**Prerequisites:** Existing change folder (`auth-session-scaffold`) and F-01 roadmap readiness
**Estimated effort:** ~2-3 sessions across 3 phases

## Open Risks & Assumptions

- SQLite driver and migration bootstrap must be chosen consistently with Go toolchain constraints.
- Fixed TTL may reduce host UX for long sessions but is acceptable for MVP foundation.
- Deferring CSRF/rate limiting is a conscious risk that must be captured as follow-up work.

## Success Criteria (Summary)

- Host can register, log in, and log out with persistent server-side sessions.
- Protected host route is inaccessible without a valid session and accessible with one.
- Auth behavior remains stable under tests for invalid credentials, duplicate email, and expired sessions.
