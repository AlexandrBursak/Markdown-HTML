---
id: T10
title: "Compose the server-rendered converter route"
layer: "wiring"
deps: ["T7"]
acs: ["AC-01", "AC-03"]
files_hint: ["src/app/page.tsx", "src/app/layout.tsx", "src/app/HomePage.module.css", "src/app/globals.css", "src/view/widgets/ConverterWidget/index.ts", "tests/unit/HomePage.test.tsx"]
owner: "Frontend Lead"
estimate: "4h"
status: "todo"
---

# T10 — Compose the server-rendered converter route

## Why

Keep the route shell thin and server-rendered per [sad §5](../sad.md#5-building-block-view), [ADR-0001](../adr/0001-keep-the-route-shell-server-rendered-around-one-client-converter.md), and the repository architecture map.

## What

Replace the scaffold placeholder with route metadata, public structure, the existing skip link, and one imported converter widget. Adapt the existing CSS Module and resolved global tokens only; preserve unknown visual-token markers.

## Definition of Done

- [ ] Route tests prove the page composes the converter widget and keeps metadata and static structure server-side.
- [ ] Tests retain the skip-to-content focus target.
- [ ] Styles use only CSS Modules and resolved custom properties from `globals.css`.
- [ ] Typecheck, lint, and production build pass.

## Notes

Before implementation, read the installed Next.js App Router guide under `node_modules/next/dist/docs/`; do not rely on older framework conventions.

