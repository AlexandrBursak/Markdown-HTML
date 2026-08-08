---
name: rexsoft-frontend
description: Implement, review, debug, or scaffold RexSoft frontend repositories built with Next.js App Router, React, TypeScript, typed API clients, and Docker Compose. Use for routes, layouts, Server and Client Components, frontend architecture, forms, data access, session boundaries, SEO, responsive UI, visual verification, tests, Docker, and backend API integration. Do not use for backend-only AdonisJS work.
---

# RexSoft Frontend

Apply the frontend baseline without loading every reference into context.

## Start

1. Read `references/onboarding.md`, `references/project-rules.md`,
   `references/coding-standards.md`, `references/security-rules.md`, and
   `references/business-context.md` before making a material change.
2. Search the references for unresolved `<!-- FILL -->` markers that affect the task.
   Do not invent product requirements, design tokens, roles, cookies, or API shapes.
   Infer values from the target repository only when evidence exists.
3. Inspect the target repository's `AGENTS.md`, README, package scripts, Compose files,
   design source, and existing implementation before selecting patterns.

## Load References Conditionally

- Routes, layouts, components, data ownership, imports, forms, or module placement:
  read `references/frontend-architecture.md` and `references/frontend-nextjs.md`.
- API calls, generated types, sessions, auth, roles, or response handling: read
  `references/contract.md`, `references/frontend-nextjs.md`, and
  `references/onboarding.md`.
- Docker, Compose, runtime, or deployment: read `references/devops-docker.md`.
- Git workflow or language conventions: read `references/git-and-language.md`.

## Execute

1. Use Server Components by default and add client boundaries only for browser
   interactivity.
2. Keep API access in typed client modules and honor the backend OpenAPI contract.
3. Keep tokens and server-only session data out of the client bundle.
4. Follow the provided design source and tokens. Do not fabricate missing product or
   visual requirements.
5. Verify responsive states and interaction states when UI behavior changes.
6. Run project-provided typecheck, lint, test, and build commands; prefer the Docker
   workflow when the repository defines it as canonical.
7. Report any baseline rule that conflicts with the actual repository instead of
   silently forcing an incompatible convention.

## Reference Layout

The checked-in `references/` entries are symlinks to the canonical files under
`common/skills/` and `frontend/skills/`. When distributing the skill, copy it with
symlink dereferencing so the installed skill is self-contained.
