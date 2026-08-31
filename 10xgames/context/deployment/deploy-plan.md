# Deploy Plan: Initial 10x Games Page

## Target

Deploy the static Astro app in `10xgames/` to GitHub Pages for the parent repository `mrozowski/10xdev3.0`.

- Production URL: `https://mrozowski.github.io/10xdev3.0/`
- Platform: GitHub Pages
- Build directory: `10xgames/dist`
- Runtime: static files only
- Node.js: 22

## Configuration

Astro is configured as a GitHub Pages project site:

- `site`: `https://mrozowski.github.io`
- `base`: `/10xdev3.0`

The app remains a static Astro build with no server adapter, backend, database, secrets, analytics, or cloud storage.

## Workflow

The root workflow `.github/workflows/deploy-10xgames.yml`:

1. Runs on pushes to `master` when `10xgames/**` or the workflow file changes.
2. Can be started manually with `workflow_dispatch`.
3. Uses `withastro/action@v6` with `path: ./10xgames`, Node.js 22, and `npm@latest`.
4. Builds the app and uploads the static Pages artifact.
5. Deploys the artifact with `actions/deploy-pages@v5`.

## Manual GitHub setup

In the repository settings, configure:

1. Go to **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Save the setting before relying on automatic deployment.

## Local verification

From `/workspace/10xgames`:

```sh
npm run build
```

Expected result:

- Build completes successfully.
- Static output is written to `dist/`.
- Generated asset paths include the `/10xdev3.0/` base path.

## Deployment verification

After pushing to `master`, check the workflow:

```sh
gh run list --workflow deploy-10xgames.yml
gh run view <run-id> --log
```

Then open:

```text
https://mrozowski.github.io/10xdev3.0/
```

Verify the initial page loads on desktop and mobile widths.

## Rollback

GitHub Pages rollback is commit-based:

1. Revert the bad commit or push a known-good commit.
2. Wait for the Pages workflow to publish the replacement artifact.
3. Confirm the production URL serves the expected version.

Local browser state is unaffected because the MVP stores game data only on the device.

## Production boundaries

- Do not put secrets in Astro source or public environment variables.
- Do not add backend behavior for this MVP deployment.
- Keep future game assets optimized and loaded only when needed to protect the PRD's initial-load target.
