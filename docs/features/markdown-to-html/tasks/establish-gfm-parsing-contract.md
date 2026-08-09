---
id: T1
title: "Establish the typed GFM parsing contract"
layer: "domain"
deps: []
acs: ["AC-01", "AC-02", "AC-05b"]
files_hint: ["package.json", "pnpm-lock.yaml", "src/entities/conversion/types.ts", "src/entities/conversion/parse.ts", "tests/unit/conversion/parse.test.ts"]
owner: "Frontend Lead"
estimate: "6h"
status: "todo"
---

# T1 — Establish the typed GFM parsing contract

## Why

Establish the pure conversion boundary required by [spec AC-02 and AC-05b](../spec.md#5-acceptance-criteria), [sad §5](../sad.md#5-building-block-view), and [ADR-0002](../adr/0002-derive-every-output-from-one-sanitized-conversion-result.md).

## What

Evaluate and add the smallest standards-compliant GFM dependency that preserves positions for representative fixtures. Define typed revisions, modes, nodes, and diagnostics in `src/entities/conversion/`, then parse raw HTML into inert text nodes rather than executable structure.

## Definition of Done

- [ ] Unit tests cover official GFM fixtures, composition-complete input, and source-position preservation.
- [ ] Raw HTML fixtures produce inert text nodes with positions.
- [ ] Typecheck and lint pass without `any` or upward imports.

## Notes

Reject parser choices that cannot support full GFM and positional diagnostics. Do not expand this task into sanitization or UI rendering.

