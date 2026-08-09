# Changelog — markdown-to-html

## markdown-to-html — convert Markdown to safe, synchronized HTML in the browser

**What:** Visitors can type Markdown and immediately compare a rendered preview with generated HTML, use official GFM constructs, switch between fragment and strict full-document output, copy the current result, inspect sanitization changes, and retain or clear the latest draft in the current browser profile.

**Why:** The feature provides one focused, no-account workflow for verifying and copying HTML while keeping untrusted input inert and retained document content out of servers and telemetry. See the [spec](./spec.md) and the load-bearing decisions to use one sanitized result for every output ([ADR-0002](./adr/0002-derive-every-output-from-one-sanitized-conversion-result.md)), gate copying on revision-matched output ([ADR-0003](./adr/0003-gate-copying-with-revision-matched-conversion-results.md)), and isolate browser persistence and disabled-by-default telemetry behind typed adapters ([ADR-0004](./adr/0004-isolate-browser-persistence-and-telemetry-behind-typed-adapters.md)).

**How to use:** Run `pnpm dev`, open `http://localhost:3000`, enter Markdown, inspect the synchronized Preview and HTML panels, choose Fragment or Full document, then use Copy. Use Clear to remove both the visible input and locally retained draft.

**Operational notes:**

- Migration: none; the feature has no backend, database, or server-side document storage.
- Feature flag / config: none. Telemetry is disabled by default; production launch remains blocked until a provider and event subset pass privacy review.
- Rollback: revert the feature commits and redeploy; locally retained Markdown may remain in browser `localStorage` until the visitor clears it or removes browser data.
- Pre-production follow-up: complete the three deferred browser proofs recorded in [spec §8](./spec.md#8-open-questions) and the [PASS review](./_review/review-2026-08-09.md): unsafe clipboard payload isolation, real clipboard capability, and storage-failure/private-mode recovery.

**Acceptance criteria delivered:** AC-01, AC-02, AC-03, AC-04, AC-04b, AC-05, AC-05b, AC-06, AC-07, AC-08, AC-09, and AC-10 are implemented and covered by the current unit/component and Chromium browser gate. The deferred cross-browser capability proofs above remain mandatory before production launch.
