---
slug: markdown-to-html
date: 2026-08-09
triage: regression
acs: [AC-01, AC-06]
commit: be76035
recurrence_of: _fixes/2026-08-09-ci-hydration-readiness.md
---

# Fix: Firefox restored stale button state before hydration

## Symptom

After browser tests began waiting for explicit converter readiness, the full CI matrix had one remaining failure. Firefox reported a hydration mismatch on every workflow reload: the server rendered the Copy HTML button disabled, but Firefox restored its prior enabled state before React hydrated the page.

## Root cause

Firefox can retain a button's dynamic disabled state across page loads. The workflow enabled Copy HTML, then reloaded to verify draft restoration. That browser-restored state changed the DOM attribute before React compared it with the server render, creating a real hydration mismatch even though the application's initial React state was deterministic.

## The pinning test

`ConverterWidget > prevents Firefox from restoring stale copy-button state before hydration` requires `autocomplete="off"` on Copy HTML. Its GOOD RED was:

> expected autocomplete="off", received no autocomplete attribute

The copy button now opts out of Firefox's button-state restoration. The complete local gate passes: 66 unit/component tests, 20 Chrome browser tests, typecheck, lint, and production build.

## Spec patch

None — AC-01 and AC-06 already require reliable conversion and draft restoration; this was a browser-specific implementation defect.

## Follow-ups

- Confirm the Firefox project no longer emits a hydration warning in the full CI browser matrix.
