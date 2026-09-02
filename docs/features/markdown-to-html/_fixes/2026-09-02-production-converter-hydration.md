# Production converter hydration failure

- Date: 2026-09-02
- Triage: regression — AC-01 already requires completed Markdown input to update both output surfaces.

## Symptom

On the public deployment, entering Markdown did not update Preview or Generated HTML. The browser console repeatedly reported a failed WebSocket connection to `/_next/hmr` with `Invalid status line`.

## Root cause

Production used `pnpm dev` through `compose.yml`. The public reverse proxy does not forward the Next.js development HMR WebSocket, leaving the client converter island unhydrated (`data-hydrated="false"`).

## Pinning test

The Docker packaging test first failed with `ENOENT` for `compose.production.yml`. It now asserts that the production Compose definition selects the `runner` Docker stage, sets `NODE_ENV=production`, and excludes development commands and bind volumes.

## Fix

`compose.production.yml` runs the standalone production image (`node server.js`) with the existing health check and `unless-stopped` restart policy. The production Compose smoke test returned HTTP 200.

## Spec impact

None. AC-01 was already explicit; the deployment configuration violated it.

## Follow-up

Use `docker compose -f compose.production.yml up -d --build` for production deployments. Do not expose `next dev` outside local development.
