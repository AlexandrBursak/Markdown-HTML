---
id: T8
title: "Expose sanitization and retention notices"
layer: "ui"
deps: ["T7"]
acs: ["AC-05", "AC-05b", "AC-06", "AC-10"]
files_hint: ["src/view/components/SanitizationNotice.tsx", "src/view/components/StatusNotice.tsx", "src/view/widgets/ConverterWidget/ConverterWidget.tsx", "src/view/widgets/ConverterWidget/ConverterWidget.module.css", "tests/unit/ConverterWidget/ConverterWidget.test.tsx"]
owner: "Frontend Lead"
estimate: "5h"
status: "todo"
---

# T8 — Expose sanitization and retention notices

## Why

Make recoverable safety and browser failures visible as required by [spec AC-05, AC-05b, AC-06, and AC-10](../spec.md#5-acceptance-criteria) and [sad §8](../sad.md#8-crosscutting-concepts).

## What

Add an expandable sanitization notice and accessible persistent status notices for storage fallback and oversize input. Present only transformation types, counts, and positions; never render source excerpts in diagnostic UI.

## Definition of Done

- [ ] Component tests prove totals and grouped removal, change, and escaped-raw-HTML details render with every position.
- [ ] Tests prove no diagnostic includes an input excerpt.
- [ ] Persistent warnings are keyboard reachable and announced without stealing focus.
- [ ] Typecheck and lint pass.

## Notes

This task shares the converter widget and component-test lane with T7 and T9, so the DAG serializes them.

