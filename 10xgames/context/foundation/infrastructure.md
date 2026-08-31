---
project: 10x Games
researched_at: 2026-08-31
recommended_platform: GitHub Pages
runner_up: Cloudflare Pages
context_type: mvp
tech_stack:
  language: JavaScript
  framework: Astro 7.2.9
  runtime: Node.js >=22.12.0
---

## Recommendation

**Deploy on GitHub Pages.**

The product is a fully static Astro 7 site with no backend, database, persistent connections, or managed services. GitHub Pages is the lowest-cost option for its public static site model, works with Astro's official GitHub Pages deployment workflow, and is the developer's stated platform preference. Its GitHub Actions workflow is sufficiently scriptable for this MVP; Cloudflare Pages is the runner-up if separate-host previews or richer hosting operations become necessary.

Sources: [Astro GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), checked 2026-08-31.

## Platform Comparison

| Platform | CLI-first | Managed/serverless | Agent-readable docs | Stable deploy API | MCP/integration | Total |
|---|---|---|---|---|---|---|
| GitHub Pages | Partial | Pass | Pass | Pass | Pass | 4.5/5 |
| Cloudflare Pages | Pass | Pass | Pass | Pass | Pass | 5/5 |
| Vercel | Pass | Pass | Pass | Pass | Pass | 5/5 |
| Netlify | Pass | Pass | Partial | Pass | Pass | 4.5/5 |
| Render Static Sites | Partial | Pass | Partial | Pass | Pass | 4/5 |
| Railway | Pass | Pass | Partial | Partial | Pass | 3.5/5 |
| Fly.io | Pass | Partial | Pass | Pass | Partial | 3.5/5 |

GitHub Pages has a partial CLI-first score because it is operated through `gh` and GitHub Actions rather than a dedicated hosting CLI. It otherwise fits the static artifact model directly, has GitHub-managed TLS and publishing, Markdown-source GitHub documentation, deterministic Action deployments, and first-class GitHub Actions/MCP integration. Public-repository hosting is free; private-repository availability depends on the account or organization plan. It offers no persistent runtime, which is intentional for this MVP.

Cloudflare Pages is the most capable alternative for a static site: static assets are free and unlimited, `wrangler pages deploy` and deployment-tail commands are available, documentation is agent-readable, and Cloudflare provides agent/MCP resources. It adds a vendor and account that the chosen project does not currently need. Pages rollbacks are dashboard-based; Workers Tail is **beta** as of 2026-08-31.

Vercel deploys a static Astro site without an adapter. Its $0 Hobby tier includes 1M Edge Requests and 100 GB transfer monthly, well above the expected 10k-100k requests. Its CLI supports deploy, rollback, and logs, and it publishes `llms.txt` plus an OAuth-backed official MCP endpoint. Hobby rollback is limited to the immediately preceding production deployment.

Netlify also supports static Astro output with no adapter, CLI deploys, deploy previews, and an official MCP server. Its free plan's 300-credit monthly cap can pause sites once exhausted; it is therefore less predictable than GitHub Pages for image-heavy game assets. The static path is GA; no non-GA capability is required.

Render Static Sites are free to deploy, CDN-served, and integrate with Git-based deploys, API/CLI operations, and an official MCP server. Free workspaces include only 5 GB outbound bandwidth and static sites emit no runtime logs. Render's docs MCP is **experimental** as of 2026-08-31.

Railway supports static Astro deploys, previews, `railway up`, and a managed MCP server, but bills usage and egress with a $5/month Hobby plan. A dedicated CLI rollback command was not found; rollback is documented through deployment controls. Its container-shaped platform and co-located service features are unnecessary here.

Fly.io can host the site in a container using `fly deploy`, `fly logs`, and release workflows, but charges for provisioned Machines and has no durable production free tier. Its MCP commands are **experimental** as of 2026-08-31. This operational model is excessive for a static artifact.

Research sources: [Cloudflare Pages + Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [Cloudflare Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/), [Vercel CLI](https://vercel.com/docs/cli/deploy), [Vercel pricing](https://vercel.com/pricing), [Astro Netlify deployment](https://docs.astro.build/en/guides/deploy/netlify/), [Netlify pricing](https://www.netlify.com/pricing/), [Render Static Sites](https://render.com/docs/static-sites), [Railway static hosting](https://docs.railway.com/guides/static-hosting), [Fly.io pricing](https://fly.io/docs/about/pricing/).

### Shortlisted Platforms

#### 1. GitHub Pages (Recommended)

It is the native fit for a static Astro site already intended for GitHub Pages deployment. It minimizes cost and operational overhead, aligns with the developer's preference, and has a current Astro 7 Action-based deployment path. The absence of a server is compatible with local-only scores and the PRD's explicit backend exclusion.

#### 2. Cloudflare Pages

Cloudflare Pages is the strongest alternative if preview deployments, edge integrations, or a later transition to Workers become useful. It is operationally excellent and free for static delivery, but does not improve the current site enough to outweigh an additional platform and its different configuration surface.

#### 3. Vercel

Vercel has refined CLI, preview, rollback, and agent-integration features, while static Astro deployment requires no adapter. It is third because its richer serverless platform is not needed for the MVP, and the developer expressly prefers GitHub Pages.

## Anti-Bias Cross-Check: GitHub Pages

### Devil's Advocate - Weaknesses

1. GitHub Pages only serves static output. SSR, cloud-synced scores, accounts, or real-time gameplay would require a separate service or a hosting migration.
2. Publishing and recovery run through GitHub Actions rather than a hosting-specific CLI, making an immediate manual rollback less direct than Vercel or Cloudflare workflows.
3. Large, unoptimized game images and audio can breach soft bandwidth or build limits and undermine the PRD's two-second load target without runtime tooling to diagnose the issue.
4. GitHub Pages does not create PR preview URLs by default, so feature-branch validation requires an additional workflow or local production preview.
5. Deploying from a repository project path requires a correct Astro `base`; missing it breaks root-relative asset URLs after release.

### Pre-Mortem - How This Could Fail

Six months after launch, the catalogue has added several games and richer media themes. The team treated static hosting as permission to ship every image and sound at source size, so load time and bandwidth grew beyond the MVP's instant-play promise. The original production-only GitHub Pages workflow worked, but without per-PR previews a bad repository base path and mobile asset reference reached the published site. A later request for synchronized leaderboards and accounts was accepted without defining a service boundary; implementation then bolted an external API onto a site designed around local browser storage, creating CORS, secret-management, and deployment complexity. During a faulty release, the team expected a dashboard-style rollback but found that recovery meant reverting to a known-good commit and waiting for the GitHub Actions deployment. The platform choice itself was not the failure: the failure was assuming GitHub Pages was a general application host rather than a deliberate static-only MVP foundation, and not budgeting for asset optimization, preview validation, and an explicit future-backend boundary.

### Unknown Unknowns

- GitHub Pages has no server-side application secret store: all values included in the static browser bundle are public.
- With Astro 7.2.9, no GitHub Pages adapter is needed. The current supported flow is a GitHub Actions deployment of the `dist/` output.
- Set `site` to the final GitHub Pages URL and set `base` to the repository path for a project site; omit or adjust `base` only for a user or organization root site.
- Browser `localStorage` meets the local-score requirement but is per-browser and can be cleared by the player; it cannot synchronize or restore scores.
- Public repository Pages hosting is free, while private repository Pages availability is controlled by the GitHub plan.

## Operational Story

- **Preview deploys**: GitHub Pages publishes the configured production branch through GitHub Actions. It does not automatically issue pull-request preview URLs; use `npm run build && npm run preview` locally until a separate preview workflow is deliberately added.
- **Secrets**: This static site needs no application secrets. Any future deployment token belongs in GitHub Actions Secrets with least privilege; never expose it to browser code. A human rotates secrets in GitHub settings.
- **Rollback**: Revert or re-run a known-good Git commit, then let the Pages Actions workflow publish it. Static content normally reverts once that deployment completes; local browser scores are unaffected.
- **Approval**: A human approves production publishing configuration, primary-secret rotation, domain/DNS changes, and deletion. An agent may build, inspect workflow logs, and prepare a revert without unattended destructive actions.
- **Logs**: Read build and deployment output with `gh run list --workflow <workflow-file>` and `gh run view <run-id> --log`; there are no server runtime logs for static Pages.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---:|---:|---|
| Future backend feature requires a platform change or external service | Devil's advocate | M | M | Keep games isolated as client-side islands and define a separate API boundary only when a backend requirement is accepted. |
| Oversized visual/audio assets slow initial load or consume bandwidth | Pre-mortem | M | H | Optimize and dimension assets, defer game-only media, and enforce the PRD's two-second load budget before each release. |
| Missing PR previews lets broken paths reach production | Devil's advocate | M | M | Require local `npm run build` and production preview before merge; add a protected preview workflow only when its value justifies maintenance. |
| Incorrect Astro repository base breaks production assets | Devil's advocate | M | H | Configure and test `site` plus `base` against the actual Pages URL before enabling the production workflow. |
| Recovery is slower than deployment-revision rollback | Devil's advocate | L | M | Preserve atomic, deployable commits and document the revert-and-redeploy procedure in the repository workflow. |
| Browser data is mistaken for durable or shared score storage | Unknown unknowns | M | L | State that scores are local-only in the UI and do not add server-dependent score behavior to the MVP. |
| Static bundle accidentally exposes a secret | Unknown unknowns | L | H | Keep secrets out of client source and build-time public environment variables; use GitHub Actions Secrets only for deployment tooling. |
| Private repository or organization policy blocks Pages | Research finding | L | M | Confirm Pages availability and the required GitHub plan before production setup; use Cloudflare Pages as the ready runner-up. |

## Getting Started

1. Set `site` in `astro.config.mjs` to `https://<owner>.github.io/<repository>/` and set `base` to `/<repository>` for a repository project site. Use the root URL and no repository base only for `<owner>.github.io`.
2. Keep Astro 7.2.9's default static output; do not add a server adapter for this MVP. Build the production artifact with `npm run build`, which emits `dist/`.
3. Add the current official Astro GitHub Pages Action workflow using `withastro/action@v6` and `actions/deploy-pages@v5`; configure its Node version as 22 or newer to satisfy this project's `>=22.12.0` engine requirement.
4. In repository Pages settings, select **GitHub Actions** as the source, then push the workflow to the production branch.
5. Validate the deployed repository-path URL and deep links on phone, tablet, and desktop before announcing the site.

## Out of Scope

The following were not evaluated in this research:

- Docker image configuration
- CI/CD pipeline setup
- Production-scale architecture (multi-region, HA, DR)
