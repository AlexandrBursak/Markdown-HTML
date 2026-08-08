# Skill: Docker Compose (frontend)

## Context
This repo ships only the Next.js `web` service. PostgreSQL, Redis and observability live
in the backend repository. The app reaches the backend over HTTP via `API_URL` /
`NEXT_PUBLIC_API_URL`.

## Rules
- Provide `compose.yml` with a single `web` service for local development.
- Use env-driven ports and the API base URL; never bake secrets into images.
- Optionally attach to the backend's external Docker network for local dev, or point
  `API_URL` at a deployed/staging backend.
- Working dir `/home/node/app`; run as `${USER_ID}:${GROUP_ID}` where practical.
- Multi-stage production Dockerfile: install → build → minimal runtime, non-root.
- Add Docker logging limits and a healthcheck.

## Commands
Document: install deps, run dev, build production image, view logs.
