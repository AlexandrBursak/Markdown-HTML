---
id: T7
title: "Build the semantic converter workspace"
layer: "ui"
deps: ["T6"]
acs: ["AC-01", "AC-02", "AC-03", "AC-09"]
files_hint: ["src/view/components/MarkdownEditor.tsx", "src/view/components/PreviewPanel.tsx", "src/view/components/HtmlOutputPanel.tsx", "src/view/components/OutputModeControl.tsx", "src/view/widgets/ConverterWidget/ConverterWidget.tsx", "src/view/widgets/ConverterWidget/ConverterWidget.module.css", "tests/unit/ConverterWidget/ConverterWidget.test.tsx"]
owner: "Frontend Lead"
estimate: "8h"
status: "todo"
---

# T7 — Build the semantic converter workspace

## Why

Materialize the one client converter island from [sad §5](../sad.md#5-building-block-view) and [ADR-0001](../adr/0001-keep-the-route-shell-server-rendered-around-one-client-converter.md).

## What

Compose converter-specific components for the Markdown editor, preview, selectable HTML source, and fragment/full-document controls. Use native semantic controls, the existing `src/app/globals.css` tokens, CSS Modules, and the scaffold skip-link precedent; create no generic primitive unless a demonstrated reuse need exists.

## Definition of Done

- [ ] Component tests prove input and mode changes render synchronized preview and HTML from the supplied state.
- [ ] The HTML panel exposes the complete source for keyboard selection.
- [ ] Copy state is visibly and semantically disabled whenever the result is stale.
- [ ] Typecheck and lint pass.

## Notes

The live design source and concrete product tokens are unresolved. Do not invent colors, spacing tokens, typography, or a second styling system.

