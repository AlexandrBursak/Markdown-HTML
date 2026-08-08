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

The browser suite uses the installed Chrome channel and starts the application on `127.0.0.1:4173`.

GitHub Actions runs this same gate for pull requests and pushes to `main`.

## Docker development

```sh
cp .env.example .env
docker compose up --build
```

The Compose project contains one non-root `web` service with a healthcheck and bounded JSON logs. This repository intentionally has no database or migration tool.

## Architecture

Source is organized under `src/` as `app`, `view`, `data`, `entities`, `providers`, and `shared`. See `docs/architecture-map.md` and the accepted ADRs under `docs/adr/` before changing layer boundaries.

Product-specific design tokens are intentionally unresolved until an approved design source exists.
