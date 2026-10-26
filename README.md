# Markdown to HTML

A browser-only Markdown converter built with Next.js App Router, React, strict TypeScript, and the RexSoft frontend layer model. Product behavior is specified in `docs/features/markdown-to-html/spec.md`.

## Requirements

- Node.js 22 or newer
- pnpm 11.5.2
- Google Chrome for the local Playwright smoke test
- Docker with Compose for the container workflow

## Local development

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality gate

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:browser
pnpm build
```

The browser smoke uses the installed Chrome channel and starts the application on `127.0.0.1:4173`, locally and in CI. Run `PLAYWRIGHT_MATRIX=full pnpm test:browser` to add Firefox, WebKit, Edge, Android Chrome emulation, and iOS Safari emulation (install them first with `pnpm exec playwright install firefox webkit msedge`).

GitHub Actions runs this same gate for pull requests and pushes to `main`.
A separate weekly and manually triggered workflow runs the 10-minute conversion profile and 30 cold-load samples with CPU and network throttling.

## Docker development

```sh
cp .env.example .env
docker compose up --build
```

The Compose project contains one non-root `web` service with a healthcheck and bounded JSON logs. This repository intentionally has no database or migration tool.

On development startup, the container reconciles the named `node_modules` volume with the frozen lockfile before starting Next.js. When an older volume was created with root ownership, the entrypoint repairs that ownership and still launches the application as the unprivileged `node` user; source files and browser data are not removed.

## Production deploy

```sh
docker compose -f compose.production.yml up -d --build
```

Always pass `-f compose.production.yml` on servers. Plain `docker compose up` starts `next dev`, which only serves its scripts to `localhost`, so behind a proxy the page never hydrates and the converter does nothing.

The production build uses webpack with a single worker and a capped Node heap so it fits a 1 GB, single-CPU host without swap; Turbopack builds get OOM-killed there.

## Architecture

Source is organized under `src/` as `app`, `view`, `data`, `entities`, `providers`, and `shared`. See `docs/architecture-map.md` and the accepted ADRs under `docs/adr/` before changing layer boundaries.

Product-specific design tokens are intentionally unresolved until an approved design source exists.
