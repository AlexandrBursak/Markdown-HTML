# Skill: Project Rules

> **New here? Read `onboarding.md` first** — it captures the non-obvious
> conventions and gotchas (API `{data}` envelope, server/client boundary, design
> tokens, NO-FABRICATION, visual verification) that this file and the other skills
> assume. The cross-repo API contract is `contract.md`; shared git/language
> rules are `git-and-language.md`.

## Stack
- Frontend: Next.js (App Router)
- Backend: AdonisJS 7 (**separate repository**, reached over HTTP)
- Package manager: pnpm
- Infra: Docker Compose

## Root Structure
This repository is the Next.js frontend:

```text
./
./src            # app/, data/, entities/, providers/, shared/, view/
./public
./docker         # frontend Dockerfile, entrypoint
./compose.yml    # frontend compose: the web service only
./README.md
./.env
./.gitignore
```

## Runtime Rule
- Local dev runs the `web` service in Docker Compose.
- The backend is **not** in this repo. Point the app at it via `API_URL`
  (server-side) / `NEXT_PUBLIC_API_URL` (browser), from `.env` (+ `.env.example`).
- Do not expose backend secrets through `NEXT_PUBLIC_*`.

## General Rules
- Use TypeScript everywhere.
- Do not hardcode secrets, tokens, emails, passwords, URLs or API keys.
- Use `.env` and provide `.env.example`.
- Keep code readable, typed and testable.
- Prefer small modules over large files.
- Do not introduce unnecessary dependencies.
- Always explain risky operations before doing them.
- Prefer production-safe defaults.
- Use Docker Compose for local development and server deployment.
- Update README when setup, commands or architecture changes.
- Add tests for critical business logic.
- Add logging for important business events and failures.
