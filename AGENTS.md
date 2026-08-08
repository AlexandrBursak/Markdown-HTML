# Repository instructions

## Project

This repository is a browser-only Markdown-to-HTML frontend built with Next.js App Router, React, and strict TypeScript. Follow `.agents/skills/rexsoft-frontend/SKILL.md` for frontend work and `docs/architecture-map.md` for the accepted project boundaries.

## Commands

- Install: `pnpm install`
- Develop locally: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Unit/component tests: `pnpm test`
- Browser/accessibility smoke: `pnpm test:browser`
- Production build: `pnpm build`
- Docker development: `docker compose up --build`

Run typecheck, lint, tests, browser smoke, and production build before proposing a merge.

## Architecture constraints

- Keep App Router route files thin; dependencies flow `app → view/data/entities/shared` and never upward.
- Use Server Components by default. Add Client Components only for browser APIs and interaction.
- Put domain contracts in `src/entities/`, product UI in `src/view/`, and domain-neutral primitives/adapters in `src/shared/`.
- Use CSS Modules and consume CSS custom properties from `src/app/globals.css`. Do not invent unresolved visual tokens.
- Do not add a backend, database, account system, or cross-device persistence without an accepted architecture decision.
- Never interpret raw Markdown HTML as executable markup. Conversion output must follow the feature security policy.
- Keep document content, generated HTML, clipboard content, and persistent identifiers out of telemetry.

## Unresolved inputs

The live design source, product-specific visual tokens, telemetry provider, and team language for comments/commits remain unresolved. Preserve the relevant `<!-- FILL -->` markers in the installed baseline until an authoritative source exists.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
