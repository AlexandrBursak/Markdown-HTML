---
id: T11
title: "Verify the complete browser workflow and accessibility"
layer: "tests"
deps: ["T9", "T10"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-04b", "AC-05", "AC-05b", "AC-06", "AC-07", "AC-08", "AC-09", "AC-10"]
files_hint: ["tests/browser/converter-workflow.spec.ts", "tests/browser/converter-accessibility.spec.ts", "tests/browser/fixtures/"]
owner: "Frontend Lead"
estimate: "8h"
status: "todo"
---

# T11 — Verify the complete browser workflow and accessibility

## Why

Prove the feature works across the Visitor flows and accessibility target in [spec §5–§6](../spec.md#5-acceptance-criteria) and [sad §10](../sad.md#10-quality-requirements).

## What

Add browser coverage for editing and composition, GFM rendering, mode switching, clipboard success and denial, diagnostics, restore and storage failure, profile isolation, Clear, oversize input, responsive states, keyboard operation, and automated accessibility scanning.

## Definition of Done

- [ ] Browser tests cover every listed AC through the public UI, including failure branches.
- [ ] Mobile, tablet, and desktop viewport smoke tests preserve usable editor and output access.
- [ ] Keyboard smoke and automated scans report zero critical or serious accessibility violations.
- [ ] `pnpm test:browser` passes.

## Notes

Use synthetic fixtures only. Storage and clipboard harnesses must not capture or report document content.

