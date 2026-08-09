---
id: T2
title: "Implement canonical sanitization and deterministic serializers"
layer: "domain"
deps: ["T1"]
acs: ["AC-02", "AC-03", "AC-05", "AC-05b", "AC-09"]
files_hint: ["src/entities/conversion/sanitize.ts", "src/entities/conversion/serialize.ts", "src/entities/conversion/convert.ts", "tests/unit/conversion/sanitize.test.ts", "tests/unit/conversion/serialize.test.ts"]
owner: "Frontend Lead"
estimate: "8h"
status: "todo"
---

# T2 — Implement canonical sanitization and deterministic serializers

## Why

Implement the shared safety and equivalence invariant from [spec AC-03, AC-05, AC-05b, and AC-09](../spec.md#5-acceptance-criteria), [sad §6](../sad.md#6-runtime-view), and [ADR-0002](../adr/0002-derive-every-output-from-one-sanitized-conversion-result.md).

## What

Add the centralized URL, image, structure, and raw-HTML policy; emit content-free diagnostics with category and position; and serialize the canonical sanitized result into preview data, HTML fragment, and the exact minimal full document.

## Definition of Done

- [ ] Security unit tests cover allowed and rejected schemes, active attributes, embedded content, images, and raw HTML.
- [ ] Diagnostic tests prove totals, categories, and positions without excerpts.
- [ ] Serializer tests prove preview/source equivalence and the exact AC-09 wrapper.
- [ ] Typecheck and lint pass.

## Notes

The sanitizer and serializers remain pure and DOM-independent. No separate preview parsing path is permitted.

