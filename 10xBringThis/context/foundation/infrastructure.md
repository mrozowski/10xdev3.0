---
project: "10xBringThis"
researched_at: 2026-07-06
recommended_platform: Railway
runner_up: Fly.io
context_type: mvp
tech_stack:
  language: Go (standard library, no framework)
  framework: net/http + HTMX
  runtime: Go 1.23.4, self-host target
---

## Recommendation

**Deploy on Railway.**

Railway is the only researched platform that fully satisfies every constraint: persistent SSE connections (HTTP/2 and WebSocket exempt from idle timeouts), Go-native builds via Railpack, co-located persistent volumes for SQLite plus a one-click managed Postgres for the later migration, and a genuinely minimal cost floor (~$5/month Hobby plan, usage largely absorbed by the included credit). It also scores highest on agent-friendliness (GA MCP server, `llms.txt`/`llms-full.txt` docs, no-GUI-required CLI for deploy/logs/redeploy) — directly relevant since this project is built and operated by an AI coding agent. Interview answers (cost-minimize, no platform familiarity, single region, co-location preferred) all point the same direction.

## Platform Comparison

| Platform | CLI-first | Managed/Serverless | Agent-readable docs | Stable deploy API | MCP / Integration | Total |
|---|---|---|---|---|---|---|
| **Railway** | Pass | Pass | Pass | Pass | Pass | 5 Pass |
| **Fly.io** | Pass | Pass | Pass | Partial (no `fly rollback`; manual image redeploy) | Pass | 4 Pass / 1 Partial |
| **Render** | Partial (CLI + Blueprints exist but dashboard is still primary for several ops) | Pass | Partial | Pass (deploy hooks/API) | Partial (no confirmed first-party MCP) | 2 Pass / 3 Partial |
| **DigitalOcean Droplet** | Partial (`doctl` provisions the VM; app deploy/rollback/logs are self-scripted, not platform-native) | Fail (raw VM — OS patching, firewall, TLS, process supervision are all manual) | Pass (mature official docs) | Fail (no built-in deploy/rollback primitive) | Fail (no MCP/agent integration) | 2 Pass / 1 Partial / 2 Fail |
| ~~Cloudflare Workers/Pages~~ | — | — | — | — | — | **Hard-filtered**: no native runtime for a Go stdlib `net/http` server (Workers run JS/Wasm, not arbitrary binaries); SSE would require a Durable-Object workaround, not a straightforward port |
| ~~Vercel~~ / ~~Netlify~~ | — | — | — | — | — | **Hard-filtered**: serverless functions with execution-time limits are incompatible with long-lived SSE connections (interview Q1 = persistent connections required) |

### Shortlisted Platforms

#### 1. Railway (Recommended)

Railpack auto-detects Go from `go.mod` and produces a static binary with zero config; Dockerfile is also supported. SSE/WebSocket connections are explicitly exempt from Railway's idle/duration limits on HTTP/2, and heartbeats close the small HTTP/1.1 gap. Persistent Volumes back SQLite directly (single-replica, which matches SQLite's single-writer model), and a managed Postgres template gives a clean, low-friction migration path later. At an estimated ~$3.50/month of actual resource usage, the whole thing fits inside the $5/month Hobby plan's included credit. Railway ships a GA local + remote MCP server and `llms.txt`/`llms-full.txt` docs, making it the most agent-operable of the researched platforms.

#### 2. Fly.io

Equally strong Go/SSE support (Fly Proxy has no connection timeout, `fly mcp server` is GA) and the cheapest raw compute (~$1.94–5.70/month for a small always-on machine). It loses ground to Railway on two points that matter for a solo, cost-sensitive, agent-driven MVP: (a) no dedicated rollback command — recovering from a bad deploy means manually finding an image digest via `fly releases --image` and redeploying, and (b) co-located Postgres is either "Managed" at $38/month (too expensive for MVP) or "Unmanaged" and officially unsupported by Fly. SQLite-on-volume has the same single-machine limitation as Railway, plus an explicit warning that the distributed-SQLite tool (LiteFS) is unmaintained and unsafe to combine with autostop.

#### 3. Render

A reasonable fallback with Docker/Go support, persistent Disks for SQLite, and a managed Postgres tier. It scores lower because its CLI/API story is less complete for full unattended agent operation (more operations still expect the dashboard) and its free tier's spin-down-on-idle behavior is actively hostile to SSE connections (would need to be disabled, pushing to a paid always-on tier immediately). Kept as the third option because it's a known quantity in the market and a safe manual fallback if either top pick has an outage or policy change.

### Also considered: DigitalOcean Droplet ($4–6/month)

A raw VM was evaluated per your request. It is the cheapest options by sticker price, but it fails the "managed/serverless" criterion outright: TLS issuance, firewall rules, SSH hardening, OS patch cadence, and process supervision (systemd unit for the Go binary) all become manual, ongoing responsibilities with no platform-provided guardrail. There is no built-in deploy/rollback/log-tail primitive — you'd script all of that yourself (or via a Dockerfile + basic CI). It was not hard-filtered (it *can* run a persistent Go SSE server and SQLite file just fine), but it scores lowest on agent-safety: an agent operating a Droplet unattended has more ways to misconfigure security-relevant settings than one operating Railway or Fly.io. Reasonable if you want to learn VM administration or need to shave the last few dollars off hosting cost, but not the default recommendation for an agent-operated MVP.

## Anti-Bias Cross-Check: Railway

### Devil's Advocate — Weaknesses

1. SQLite lives on a single Railway volume with no built-in multi-region replication — a host-level incident means recovery depends entirely on the automated snapshot cadence, potentially losing recent claims/comments.
2. Railway's usage-based billing model has been revised multiple times in its history (free tier removed, pricing model changed 2022–2024); without a hard spending cap configured, a traffic spike (e.g., a viral event) could produce a surprise bill.
3. There is no `railway rollback` CLI command — recovering from a bad deploy under time pressure requires the dashboard (within a 72-hour Hobby retention window) or a full source redeploy.
4. Railway runs on its own infrastructure ("Railway Metal") rather than a resold hyperscaler — it has a shorter public operational track record than AWS/GCP-backed competitors.
5. HTTP/1.1 SSE connections idle-close after 60 seconds unless heartbeats are sent explicitly in app code — an easy implementation oversight that only surfaces under real usage, not local testing.

### Pre-Mortem — How This Could Fail

The team shipped 10xBringThis on Railway's Hobby plan, confident the $5 included credit covered everything. Six months in, concurrent SSE connections during a popular event pushed actual usage past the credit, and because no hard spending cap had been set, the bill spiked unexpectedly. Meanwhile the SQLite database lived on a single volume with no replica; a host-level incident meant the only recovery path was the prior day's automated snapshot, losing a day of claims and comments. When a bad deploy needed reverting, the on-call developer discovered there was no `railway rollback` command and had to dig through the dashboard's deployment history under pressure. Separately, an SSE heartbeat had been overlooked in the Go handler, so participants on HTTP/1.1 connections silently disconnected after 60 seconds of inactivity during high load — support complaints about "claims not updating live" arrived before anyone traced it to an idle-timeout, not an application bug. The team eventually added heartbeats, a spending cap, and a Postgres migration, but reactively, under pressure, rather than as a planned step.

### Unknown Unknowns

- Railway Metal is proprietary infrastructure, not a resold hyperscaler — regional footprint and long-term reliability are less independently verifiable than AWS/GCP-backed platforms.
- A SQLite-backed volume is pinned to one machine; discovering that horizontal scaling requires a full Postgres migration (not just a config toggle) often happens only when a team tries to add a second replica under load.
- Trial-created volumes are deleted 30 days after trial credit expiry — staying on the free Trial too long risks silent data loss before ever reaching the paid Hobby tier.
- There is no native regional failover on Hobby/Pro — a regional outage takes the single-machine SQLite app down entirely, which can surprise a team assuming "managed" implies built-in high availability.
- Railway's historical pricing changes mean the current usage-based model, while currently favorable, is not guaranteed to remain stable over a multi-year horizon the way a hyperscaler's pricing tends to be.

**Decision**: proceeding with Railway — the risks above are typical of any young, cost-efficient PaaS and are addressed with concrete mitigations in the risk register below (spending cap, SSE heartbeat, snapshot verification, planned Postgres migration trigger). None of them are disqualifying for a 3-week, single-region MVP.

## Operational Story

- **Preview deploys**: Railway creates a preview environment per PR when GitHub integration + PR environments are enabled in project settings; each preview gets its own URL and a separate (or cloned) volume — verify volume cloning behavior before relying on it for realistic preview data.
- **Secrets**: Environment variables/secrets are stored in the Railway dashboard per-service and injected at runtime (`railway variables` / `railway variables set` via CLI); rotate by setting a new value and redeploying, no separate GitHub Secrets layer needed unless CI also needs the value for `RAILWAY_TOKEN`-based deploys.
- **Rollback**: No CLI rollback — within the 72-hour (Hobby) image retention window, use the dashboard to redeploy a prior image; beyond that window, `git revert` + `railway up` from the prior commit. SQLite data does not roll back with the image — a bad migration requires a manual data fix or restore from snapshot.
- **Approval**: An agent may run `railway up`, `railway logs`, `railway redeploy`, and manage non-destructive env vars unattended. A human must approve: enabling production traffic cutover on first launch, deleting a volume, rotating the primary database credential, and raising the spending cap.
- **Logs**: `railway logs` (live tail), `railway logs --http` (access logs with status/duration), `railway logs --since 1h --filter "@level:error"` for triage — all read-only and safe for an agent to run unattended; the Railway MCP server (`mcp.railway.com` or local `railway mcp install`) exposes the same data as structured tool calls.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| SQLite single-volume host failure loses recent writes | Devil's advocate | L | H | Verify Railway's automated volume snapshot cadence; add an app-level periodic export to object storage (Railway Buckets) as a second safety net |
| Unattended usage spike causes surprise bill | Devil's advocate / Pre-mortem | M | M | Set a hard spending limit on the Workspace Usage page immediately after go-live |
| No CLI rollback slows incident recovery | Devil's advocate | M | M | Document the dashboard rollback steps (or `git revert` + `railway up`) in the repo's runbook before first production incident, not during one |
| HTTP/1.1 SSE idle-close drops "live" claim updates | Devil's advocate / Pre-mortem | M | M | Implement an SSE heartbeat comment (`: keepalive`) every <60s in the Go handler; confirm HTTP/2 is negotiated end-to-end |
| Horizontal scaling silently requires a Postgres migration | Unknown unknowns | L (at MVP scale) | M | Treat "add a second replica" as a trigger to migrate SQLite → Railway Postgres first, not a config change |
| Trial volume deleted 30 days after trial credit expiry | Unknown unknowns | L | H (data loss) | Upgrade to Hobby plan before the Trial window lapses; do not develop against Trial past a few days |
| No native regional failover on Hobby/Pro | Unknown unknowns | L | M | Acceptable for a single-region MVP per interview answer; revisit if PRD's "medium" user scale grows materially |
| Railway pricing model has shifted multiple times historically | Devil's advocate / Unknown unknowns | L | M | Re-check pricing/plans page quarterly; keep the app container-portable (Dockerfile fallback) to ease a platform switch if needed |

## Getting Started

1. Install the CLI: `curl -fsSL https://railway.com/install.sh | sh` (or `npm i -g @railway/cli`), then `railway login`.
2. From the repo root, run `railway init` to create and link the project (Railpack will auto-detect Go from `go.mod` in `app/`).
3. Add a persistent volume for the SQLite file: `railway volume add` (or via dashboard), mount at e.g. `/data`, and point the app's SQLite DSN at `${RAILWAY_VOLUME_MOUNT_PATH}/app.db`.
4. If using `mattn/go-sqlite3` (CGO), no extra config needed — Railpack adds build-time gcc automatically; if using `modernc.org/sqlite` (pure Go), you can keep `CGO_ENABLED=0` for a smaller image.
5. Deploy with `railway up`, then verify SSE behavior in production with `railway logs --http` and a manual multi-client claim test before sharing the link with real users.

## Out of Scope

The following were not evaluated in this research:
- Docker image configuration
- CI/CD pipeline setup
- Production-scale architecture (multi-region, HA, DR)
