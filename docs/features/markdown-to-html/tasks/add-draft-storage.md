---
id: T3
title: "Add resilient latest-draft browser storage"
layer: "infra"
deps: []
acs: ["AC-06", "AC-07", "AC-08"]
files_hint: ["src/shared/browser/draftStorage.ts", "tests/unit/browser/draftStorage.test.ts"]
owner: "Frontend Lead"
estimate: "5h"
status: "todo"
---

# T3 — Add resilient latest-draft browser storage

## Why

Provide the typed browser boundary described by [spec AC-06–AC-08](../spec.md#5-acceptance-criteria), [data-model.md](../data-model.md), and [ADR-0004](../adr/0004-isolate-browser-persistence-and-telemetry-behind-typed-adapters.md).

## What

Implement one well-known `localStorage` key behind `src/shared/browser/draftStorage.ts`, including read, replace, remove, typed failure outcomes, and current-tab memory fallback. Expose coordination points for the 500 ms autosave window without adding persistence outside the browser.

## Definition of Done

- [ ] Adapter tests cover empty restore, retained restore, replacement, denial/quota failure, deletion failure, and tab-memory fallback.
- [ ] Tests prove another storage harness/profile cannot see the retained value.
- [ ] Clear tests prove both application-controlled copies are absent after success.
- [ ] Typecheck and lint pass.

## Notes

Markdown is confidential and must not be logged. This is browser storage, not a database or migration task.

