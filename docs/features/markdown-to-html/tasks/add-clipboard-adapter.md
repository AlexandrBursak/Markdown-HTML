---
id: T4
title: "Add a typed dual-MIME clipboard adapter"
layer: "infra"
deps: []
acs: ["AC-04", "AC-04b"]
files_hint: ["src/shared/browser/clipboard.ts", "tests/unit/browser/clipboard.test.ts"]
owner: "Frontend Lead"
estimate: "4h"
status: "todo"
---

# T4 — Add a typed dual-MIME clipboard adapter

## Why

Isolate browser clipboard differences required by [spec AC-04 and AC-04b](../spec.md#5-acceptance-criteria), [sad §6](../sad.md#select-output-mode-and-copy-the-current-result), and [ADR-0003](../adr/0003-gate-copying-with-revision-matched-conversion-results.md).

## What

Wrap the browser clipboard API in a typed adapter that attempts one dual-MIME write and distinguishes confirmed success, denial, unsupported behavior, and other failure. Keep focus and fallback UI policy outside the adapter.

## Definition of Done

- [ ] Unit tests prove `text/plain` and `text/html` carry the identical supplied current HTML.
- [ ] Unit tests cover confirmed success, denial, unsupported API behavior, and write failure.
- [ ] The adapter never logs or retains clipboard content.
- [ ] Typecheck and lint pass.

## Notes

Do not add a second fallback view; T9 owns focus and manual selection in the existing HTML panel.

