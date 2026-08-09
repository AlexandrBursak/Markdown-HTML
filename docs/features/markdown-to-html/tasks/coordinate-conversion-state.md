---
id: T6
title: "Coordinate revision-matched conversion state"
layer: "app"
deps: ["T2", "T3", "T4", "T5"]
acs: ["AC-01", "AC-03", "AC-06", "AC-09", "AC-10"]
files_hint: ["src/view/widgets/ConverterWidget/useConverterState.ts", "src/view/widgets/ConverterWidget/types.ts", "tests/unit/ConverterWidget/useConverterState.test.ts"]
owner: "Frontend Lead"
estimate: "8h"
status: "todo"
---

# T6 — Coordinate revision-matched conversion state

## Why

Own the interactive use case described in [sad §6](../sad.md#6-runtime-view) while enforcing freshness from [ADR-0003](../adr/0003-gate-copying-with-revision-matched-conversion-results.md).

## What

Add a converter-state hook that coordinates completed input/composition events, restoration, autosave, conversion, output modes, Unicode code-point counting, result acceptance, and copy eligibility. Keep parsing and browser-policy logic delegated to the typed modules from T2–T5.

## Definition of Done

- [ ] State tests prove composition events do not publish incomplete input and current results update both outputs together.
- [ ] Tests prove stale revisions and stale modes cannot enable copy.
- [ ] Tests prove restored input converts automatically and oversize input remains editable with a warning.
- [ ] Typecheck and lint pass.

## Notes

Start on the main thread; do not introduce a Web Worker without failed boundary evidence and a follow-up decision.

