## Summary

This PR ships the browser-only Markdown-to-HTML converter defined by the [feature spec](docs/features/markdown-to-html/spec.md). It provides synchronized safe preview and HTML output, official GFM behavior, fragment/full-document modes, dual-format copy with recovery, sanitization diagnostics, and browser-profile draft retention without adding a backend or telemetry provider.

## Acceptance criteria

- AC-01 — Completed input and composition events update both output surfaces ✓
- AC-02 — Official GFM constructs retain their semantics in preview and HTML ✓
- AC-03 — Preview and generated HTML derive from one normalized sanitized result ✓
- AC-04 / AC-04b — Copy uses the current literal/rich HTML and provides a selectable fallback on failure ✓
- AC-05 / AC-05b — Unsafe behavior and raw HTML remain inert and are reported by category and position ✓
- AC-06 / AC-07 / AC-08 — Drafts restore within one browser profile, stay profile-isolated, and clear completely ✓
- AC-09 — Fragment and strict full-document output are exact and freshness-gated ✓
- AC-10 — Oversized input remains editable, warns, and cannot copy stale output ✓

## Design

- Spec: `docs/features/markdown-to-html/spec.md`
- Architecture: `docs/features/markdown-to-html/sad.md`
- Decisions: `docs/features/markdown-to-html/adr/`
- Data model: `docs/features/markdown-to-html/data-model.md` (browser storage only; no migration)
- API: none; `docs/features/markdown-to-html/contracts/api-sync-report.md` records the N/A result
- Review: `docs/features/markdown-to-html/_review/review-2026-08-09.md` (`PASS`)

## Tasks (SDD-Task trailers)

- `6f4782b` — T1: establish the GFM parsing contract
- `511665d` — T2: sanitize and serialize output
- `ae663a9` — T3: add resilient draft storage
- `eaf72e4` — T4: add dual-MIME clipboard handling
- `b46254b` — T5: define disabled telemetry
- `c528382` — T6: coordinate revision-matched conversion state
- `90bdd88` — T7: build the converter workspace
- `bb07fdd` — T8: expose conversion notices
- `a6220ce` — T9: complete copy and clear workflows
- `bb47611` — T10: compose the App Router route
- `2841a01`, `72cefd6`, `35f5e71` — T11: verify browser workflows and profile isolation
- `67734d3`, `bb21b39` — T12: prove security, accessibility, GFM, and performance contracts
- Review fixes: `b1a0b2a`, `33ed020`, `abd3ce1`, `840e21b`; expanded regression coverage: `27a950b`

## Verification

- Typecheck: `pnpm typecheck` — PASS
- Lint: `pnpm lint` — PASS
- Unit/component: `pnpm test` — PASS (13 files, 64 tests)
- Browser/accessibility: `pnpm test:browser` — PASS (20 Chromium tests)
- Production build: `pnpm build` — PASS (static `/` route generated)
- Ran the feature: the Playwright gate started the real Next.js app and observed live/GFM conversion (AC-01/AC-02), raw-HTML escaping and execution blocking (AC-05/AC-05b), exact current literal/rich clipboard payloads (AC-04), mode switching plus draft restore/clear (AC-06/AC-08/AC-09), browser-profile isolation (AC-07), keyboard/accessibility behavior, and the conversion latency boundary (AC-10).
- CI regression: the performance profiles now run serially on the canonical desktop Chrome project after an untimed hydration warm-up; the repaired 5-second smoke profile passed locally without a hydration warning.
- CI matrix: GitHub runs the six desktop/mobile projects with one worker to prevent shared-runner contention; all 20 Chrome tests pass locally under the same `CI=1` configuration.
- Docker: `docker compose up --build -d` repaired an existing stale/root-owned dependency volume, reached `healthy`, served HTTP 200, and ran Next.js as the unprivileged `node` user; a compatible restart reconciled dependencies in 268 ms.

## Operational notes

- Migration: none.
- Feature flag / config: none; telemetry remains disabled by default.
- Rollback: revert and redeploy; browser-local drafts are not removed automatically.
- Production launch remains blocked on telemetry/privacy approval and the three deferred browser proofs in `spec.md` §8. These accepted review deferrals do not block merging this PR.

🤖 Generated with Codex
