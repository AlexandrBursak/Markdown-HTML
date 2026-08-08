---
id: T12
title: "Prove security and performance quality gates"
layer: "tests"
deps: ["T2", "T10"]
acs: ["AC-02", "AC-03", "AC-04", "AC-05", "AC-05b", "AC-10"]
files_hint: ["tests/browser/converter-security.spec.ts", "tests/browser/converter-performance.spec.ts", "tests/browser/fixtures/"]
owner: "Frontend Lead"
estimate: "8h"
status: "todo"
---

# T12 — Prove security and performance quality gates

## Why

Turn the measurable safety, correctness, and latency targets in [spec §6](../spec.md#6-non-functional-requirements) and [sad §10](../sad.md#10-quality-requirements) into release evidence.

## What

Add browser security fixtures for elements, attributes, schemes, images, raw HTML, preview, and both clipboard representations. Add measured conversion tests around the 100,000-code-point boundary and a cold-load synthetic profile for initial usability.

## Definition of Done

- [ ] Browser security tests prove known unsafe fixtures execute no active content in preview or copied HTML.
- [ ] Successful clipboard payloads exactly match the current visible sanitized HTML in both MIME forms.
- [ ] Conversion p95 is at most 100 ms through 100,000 Unicode code points.
- [ ] Cold initial usability p95 is at most 2 seconds under the specified device and network profile.

## Notes

If main-thread conversion misses its gate, report the evidence and open a worker follow-up that preserves the revision contract; do not silently widen the target.
