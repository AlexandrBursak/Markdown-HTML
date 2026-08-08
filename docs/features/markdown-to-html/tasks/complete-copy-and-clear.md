---
id: T9
title: "Complete copy and clear interaction recovery"
layer: "ui"
deps: ["T3", "T4", "T8"]
acs: ["AC-04", "AC-04b", "AC-08", "AC-09", "AC-10"]
files_hint: ["src/view/components/ConverterActions.tsx", "src/view/widgets/ConverterWidget/ConverterWidget.tsx", "src/view/widgets/ConverterWidget/ConverterWidget.module.css", "tests/unit/ConverterWidget/ConverterWidget.test.tsx"]
owner: "Frontend Lead"
estimate: "6h"
status: "todo"
---

# T9 — Complete copy and clear interaction recovery

## Why

Close the copy and retention flows in [spec AC-04, AC-04b, and AC-08–AC-10](../spec.md#5-acceptance-criteria) and [sad §6](../sad.md#6-runtime-view).

## What

Wire semantic Copy and Clear actions to the current state and typed adapters. Confirm copy only after browser success; on failure, show the error, focus the existing HTML panel, and leave all source selectable. Clear must invalidate output and remove input plus both retained copies.

## Definition of Done

- [ ] Component tests prove dual-MIME copy is called only for a revision- and mode-current result.
- [ ] Failure tests prove focus moves to the existing selectable HTML panel.
- [ ] Clear tests prove input, profile storage, tab memory, and current output are removed.
- [ ] Typecheck and lint pass.

## Notes

Clipboard and document content must remain outside telemetry and logs.

