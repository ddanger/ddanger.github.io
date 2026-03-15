# Automation Runbook

This repository uses a source-first automation model:

1. Validate page contracts from source files under `src/`
2. Verify generated artifacts are committed and formatted
3. Regenerate operational artifacts (sitemap)
4. Monitor live route health
5. Sync generated output after merges when needed

All automation scripts are ESM (`.mjs`).

## Source of Truth

Source inputs:

- `src/site.json`
- `src/pages/*/meta.json`
- `src/pages/*/content.html`
- `src/partials/*.html`

Generated outputs:

- `index.html`
- `about/index.html`
- `services/index.html`
- `contact/index.html`

## Workflows

### 1) Build and Format Guardrails

File: `.github/workflows/build-and-format.yml`

Trigger:

- Pull requests
- Push to `main`

Behavior:

- Runs `npm run verify:generated`
- Runs `npm run format:check`
- Enforces generated-output and formatting integrity

### 2) PR Quality Gates (Source Validation)

File: `.github/workflows/pr-quality-gates.yml`

Trigger:

- Pull requests to `main` when source/validation files change

Behavior:

- Runs `node scripts/validate-source.mjs`
- Validates source contracts, canonical consistency, and source-level links
- Fails PR with source-file-level error output

### 3) Sitemap Auto

File: `.github/workflows/sitemap-auto.yml`

Trigger:

- Push to `main` when source/sitemap logic changes
- Manual dispatch

Behavior:

- Runs `node scripts/generate-sitemap.mjs`
- Discovers routes from `src/pages` metadata
- Excludes helper redirects (`/schedule/`, `/cv/`, `/resume/`) and `noindex` pages
- Uses git history for `lastmod`
- Commits `sitemap.xml` only when changed

### 4) Uptime Monitor

File: `.github/workflows/uptime-monitor.yml`

Trigger:

- Hourly schedule
- Manual dispatch

Behavior:

- Runs `node scripts/uptime-check.mjs`
- Auto-discovers public indexable routes from source metadata
- Prints markdown summary table
- Sends one Slack alert on failure and marks workflow failed
- Sends no Slack message on success

### 5) Generated Output Sync

File: `.github/workflows/generated-output-sync.yml`

Trigger:

- Push to `main` when source/build template inputs change
- Manual dispatch

Behavior:

- Runs `npm run build`
- Commits generated HTML artifacts directly to `main` only when changed

## Branch Protection Requirement

Post-merge automation workflows (`sitemap-auto.yml`, `generated-output-sync.yml`) push directly to `main`.

If your ruleset does not allow GitHub Actions as a bypass actor, add `Repository admin` to bypass and use a personal token secret for workflow pushes.

## Required Secret

Set repository secret:

- `SLACK_WEBHOOK_URL`
- `MAIN_PUSH_TOKEN` (fine-grained PAT with repository Contents: Read and write)

Path:

- GitHub repository Settings -> Secrets and variables -> Actions -> New repository secret

## Scripts

- `scripts/validate-source.mjs` - source contract + link validation
- `scripts/generate-sitemap.mjs` - source-driven sitemap generation
- `scripts/uptime-check.mjs` - route-discovered uptime checks
- `scripts/lib/routes.mjs` - shared page/route discovery
- `scripts/build.mjs` - source to generated HTML build
- `scripts/verify-generated.mjs` - generated-output integrity check

## Local Commands

- `npm run validate:source`
- `npm run build`
- `npm run verify:generated`
- `npm run generate:sitemap`
- `npm run check:uptime`

## Common Triage

### Source validation failure

- Check missing required fields in `src/pages/*/meta.json`
- Check canonical/og URL mismatches
- Check unresolved `href`/`src`/`srcset` references in source fragments

### Generated-output drift

- Run `npm run build`
- Re-run `npm run verify:generated`
- Confirm generated files are committed (or allow post-merge sync workflow to commit updates)

### Sitemap mismatch

- Confirm page `meta.robots` does not include `noindex` for indexable pages
- Confirm `outputPath` is correct in page metadata
- Re-run `npm run generate:sitemap`

### Uptime alert

- Review workflow job summary for failing route/status/latency
- Confirm route exists in source metadata and resolves in production
- Confirm `SLACK_WEBHOOK_URL` is valid if alerts are missing

## Process Mapping

Automation coverage for recurring maintenance from `monitoring-plan.md`:

- Link and metadata audits -> source validation gate
- Generated HTML consistency checks -> build/format guardrails + sync workflow
- Sitemap maintenance -> source-driven sitemap automation
- Availability spot checks -> scheduled uptime monitoring
