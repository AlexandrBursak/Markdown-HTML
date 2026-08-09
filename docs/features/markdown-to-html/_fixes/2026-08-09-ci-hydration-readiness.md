---
slug: markdown-to-html
date: 2026-08-09
triage: regression
acs: [AC-01, AC-06, AC-10]
commit: a5e8cd5
recurrence_of: _fixes/2026-08-09-ci-browser-contention.md
---

# Fix: Cross-browser tests interacted before converter hydration

## Symptom

With CI contention removed, the six-project browser matrix still expected interactions to update the converter reliably. Firefox and WebKit instead emitted hydration mismatch warnings; input fills sometimes left generated HTML empty, clipboard workflows timed out, and the run ended with one failure plus fourteen flaky tests.

## Root cause

Browser tests treated server-rendered textareas and buttons as interactive immediately after navigation. On slower engines, Playwright could fill or click those controls before React attached handlers and before browser draft restoration completed, losing the event and mutating DOM during hydration. The performance warm-up waited for output only after it had already raced the first input.

## The pinning test

`ConverterWidget > publishes readiness only after client restoration completes` is a component-level readiness contract. Its GOOD RED was:

> expected the converter region to have `data-hydrated="false"`, received no `data-hydrated` attribute

The converter now changes readiness from `false` to `true` only after restoration, and the shared Playwright navigation helper waits for `true` before any interaction or timing sample. The complete local gate passes: 65 unit/component tests, 20 Chrome browser tests, typecheck, lint, and production build.

## Spec patch

None — the spec was right; AC-01, AC-06, and AC-10 already require completed input, restoration, and measured conversion behavior to operate after the converter is usable.

## Follow-ups

- Run `/sdd:review markdown-to-html` because the fix crosses the widget and browser-test boundary and touches more than five files.
