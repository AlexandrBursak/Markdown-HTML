---
status: Accepted
owner: "Architect / Tech Lead"
reviewers: ["Tech Lead"]
updated_at: "2026-08-08"
feature_size: "S"
ticket: "markdown-to-html"
---

# 0001 — Keep the route shell server-rendered around one client converter

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Architect / Tech Lead and Product Owner

## Context

The public converter needs App Router metadata and structure as well as browser-only state, storage, clipboard, and composition events. The client boundary determines bundle composition and ownership across route, view, and adapter layers.

## Decision drivers

- Initial usability p95 ≤2 s under the profile specified in the feature spec.
- Server Components are the repository default; browser APIs require a Client Component.
- Routes must remain thin and business logic must remain outside React components.

## Considered options

1. **Server shell with one converter island** — keep the route server-rendered and concentrate interactive state in one client widget.
2. **Client-render the entire route** — make the whole page one client boundary with simpler composition but more client code.
3. **Split the converter into several client islands** — isolate editor, preview, and output interactions but add cross-island coordination.

## Decision outcome

**Chosen: Server shell with one converter island.** It preserves server-rendered public structure while keeping revision, output-mode, and browser API coordination inside one explicit owner.

## Consequences

**Positive**
- Static route structure and metadata do not join the client graph.
- One widget owns the synchronized interaction state.

**Negative**
- The converter widget is a deliberate client-side application boundary.
- Imports beneath that boundary require bundle discipline.

**Neutral**
- The widget may be decomposed into child components without changing the route boundary.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4
- Related ADR: [[0002-derive-every-output-from-one-sanitized-conversion-result]]
