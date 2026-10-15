# TideMail

TideMail is a lightweight temporary email service built with Cloudflare Workers and D1. Create temporary addresses on configured domains, receive and manage messages, and enable outbound email when needed.

[简体中文](README.md) · [Cloudflare deployment guide](docs/github-action-tutorial.md)

## Features

- Create temporary addresses from one or more configured email domains
- Receive messages through Cloudflare Email Routing, then view or delete them in the web app
- Optionally enable outbound email, a site password, and Cloudflare Turnstile
- Simplified Chinese and English, with light, dark, and system theme options
- Keep messages in D1 for 7 days; an hourly scheduled task removes expired messages

## Deploy to Cloudflare

A Cloudflare Worker serves the frontend assets and email endpoints. Messages are stored in Cloudflare D1. The repository includes a GitHub Actions workflow: pushes to `main` run tests and build the app, apply D1 migrations, and deploy the Worker.

Follow the [Cloudflare deployment guide](docs/github-action-tutorial.md) to create D1, configure GitHub Actions secrets, and connect email routing. The first redesign migration, `0004_simplify_product.sql`, clears existing messages and removes tables used by the retired public API and statistics features.

The Cloudflare Worker resource is named `tidemail`. After deploying it, switch Email Routing and any existing custom-domain routes to the new Worker, verify mail delivery, then remove the old `vmail` Worker.

## Local development

You need Node.js 22.8 or newer and pnpm.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
cp wrangler.toml wrangler.local.toml
```

Set the local D1 name and ID, email domain, and other non-secret values in `wrangler.local.toml`. Put local cookie, Turnstile, site-password, and sending credentials in `.env`. The local Wrangler config is ignored by Git and does not change the deployment template. Start the Worker:

```bash
pnpm dev
```

In a second terminal, start the frontend development server:

```bash
pnpm frontend:dev
```

The frontend proxies `/api` requests to the local Worker at `127.0.0.1:8787`.

## Verification

```bash
pnpm test:unit
pnpm test:coverage
pnpm test:core-coverage
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm exec wrangler deploy --dry-run
```

`pnpm test` runs the coverage gates and Playwright E2E suite. Before the first E2E run, install Chromium with `pnpm exec playwright install chromium`. E2E tests mock the Worker API; they do not validate a live Cloudflare account, D1 database, or email provider.

## License

[GNU General Public License v3.0](LICENSE)
