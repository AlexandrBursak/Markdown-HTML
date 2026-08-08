## Summary

This PR establishes the browser-only Next.js and strict TypeScript foundation described by the [architecture map](docs/architecture-map.md). It adds the accessible application shell, test harnesses, CSS token foundation, non-root Docker packaging, repository guidance, and a CI gate so feature development can proceed within the accepted boundaries.

## Acceptance criteria

`_scaffold` is a survey-generated bootstrap and has task Definitions of Done rather than feature acceptance criteria.

- S1 — The strict App Router project installs, builds, and boots ✓
- S2 — Unit/component and browser accessibility harnesses pass, including keyboard focus ✓
- S3 — Global custom properties and a CSS Module prove the styling pipeline without fabricated product tokens ✓
- S4 — The Compose image builds and boots healthy as a non-root user with bounded logging ✓
- S5 — RexSoft guidance and repository rules document verified commands and boundaries ✓
- S6 — CI runs the documented typecheck, lint, unit, browser, and production-build gate ✓

## Design

- Architecture: `docs/architecture-map.md`
- Decisions: `docs/adr/0001-nextjs-typescript-frontend.md`, `docs/adr/0002-layered-frontend-architecture.md`, and `docs/adr/0003-browser-only-persistence.md`
- Scaffold plan: `docs/features/_scaffold/tasks.json`
- Review: `docs/features/_scaffold/_review/review-2026-08-08.md`
- Data model + migration: none
- API: none

## Tasks (SDD-Task trailers)

- `7dc387c` — S1: Create the Next.js TypeScript foundation
- `cebe9ba` — S2: Wire frontend test harnesses
- `ce6a305` — S3: Establish the token and CSS Module foundation
- `23e49e2` — S4: Add Docker packaging
- `2b51461` — S5: Install RexSoft frontend guidance
- `2f5a358` — S6: Add the frontend quality gate

## Verification

- Typecheck: `pnpm typecheck` — PASS
- Lint: `pnpm lint` — PASS
- Unit/component: `pnpm test` — PASS (5 files, 5 tests)
- Browser/accessibility: `pnpm test:browser` — PASS (Chromium boot, visible heading, keyboard focus, zero axe violations)
- Production build: `pnpm build` — PASS (static `/` route generated)
- Ran the feature: Compose built the `web` image, started it on local port 4317, reported healthy, returned HTTP 200 with the expected “Markdown to HTML” page, and ran as `uid=1000(node)` rather than root.

## Operational notes

- Migration: none.
- Feature flag / config: optional Compose `APP_PORT`, `USER_ID`, and `GROUP_ID` variables; no product feature flag.
- Rollback: revert the scaffold commits; no persistent-data rollback is required.

🤖 Generated with Codex
