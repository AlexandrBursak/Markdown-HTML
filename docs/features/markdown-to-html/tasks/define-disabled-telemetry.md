---
id: T5
title: "Define disabled-by-default outcome telemetry"
layer: "infra"
deps: []
acs: []
files_hint: ["src/data/telemetry/types.ts", "src/data/telemetry/disabledTelemetry.ts", "tests/unit/telemetry/disabledTelemetry.test.ts"]
owner: "Frontend Lead"
estimate: "3h"
status: "todo"
---

# T5 — Define disabled-by-default outcome telemetry

## Why

Enforce the privacy and production-launch boundary in [spec §6.1](../spec.md#61-security--privacy), [sad §8](../sad.md#8-crosscutting-concepts), and [ADR-0004](../adr/0004-isolate-browser-persistence-and-telemetry-behind-typed-adapters.md).

## What

Define a provider-neutral allowlisted event contract and a disabled implementation under `src/data/telemetry/`. Do not add a provider adapter, environment configuration, or production emission before privacy review.

## Definition of Done

- [ ] Contract tests prove the disabled implementation emits nothing.
- [ ] Type tests or narrow constructors exclude Markdown, HTML, clipboard content, URLs, excerpts, and persistent identifiers.
- [ ] The contract supports only approved outcome categories and a tab-scoped session if later enabled.
- [ ] Typecheck and lint pass.

## Notes

Production launch remains blocked on provider and event-subset approval; preserve the unresolved `<!-- FILL -->` markers.

