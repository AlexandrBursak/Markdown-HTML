# Changelog — _scaffold

## _scaffold — establish the browser-only frontend foundation

**What:** The repository now has a strict Next.js App Router and TypeScript foundation that boots in the browser, includes accessible keyboard navigation, uses CSS Modules backed by global custom properties, and ships with local, browser, build, CI, and Docker verification.

**Why:** This foundation materializes the boundaries in the [architecture map](../../architecture-map.md) so product work can begin without inventing infrastructure or crossing the accepted browser-only architecture. The load-bearing decisions are [ADR-0001](../../adr/0001-nextjs-typescript-frontend.md), [ADR-0002](../../adr/0002-layered-frontend-architecture.md), and [ADR-0003](../../adr/0003-browser-only-persistence.md).

**How to use:** Run `pnpm dev` for local development, or `docker compose up --build` for the containerized development service. Verify changes with `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:browser`, and `pnpm build`.

**Operational notes:**

- Migration: none.
- Feature flag / config: optional `APP_PORT`, `USER_ID`, and `GROUP_ID` Compose variables; no product feature flag.
- Rollback: revert the scaffold commits; no database, migration, or persistent data rollback is required.

**Acceptance criteria delivered:** `_scaffold` has no feature acceptance criteria. Tasks S1–S6 and their Definitions of Done are complete: strict App Router boot, test harnesses, token and CSS Module foundation, non-root Docker packaging, repository guidance, and the CI quality gate.
