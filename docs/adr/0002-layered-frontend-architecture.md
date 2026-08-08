# ADR-0002: Layered frontend architecture

- **Status:** Accepted
- **Date:** 2026-08-08

## Context

The converter combines pure transformation rules, browser integrations, and interactive UI. Mixing these concerns inside route or React component files would make security contracts and deterministic testing harder.

## Decision

Adopt the RexSoft layer model under `src/`: `app`, `entities`, `shared`, `view`, plus `data` and `providers` only when needed. Dependencies flow downward: `app` may compose all layers; `view` may use `data`, `entities`, and `shared`; lower layers never import route or view code. Keep business logic out of React components.

Use CSS Modules for component styling and CSS custom properties in `src/app/globals.css` for design tokens.

## Alternatives considered

- A single feature folder would be smaller initially but would blur pure conversion logic, browser adapters, and UI ownership.
- A rigid domain architecture with backend-style ports for every function would over-engineer a small frontend.

## Consequences

- Conversion and sanitization contracts can be tested without rendering UI.
- Routes stay thin, while the converter widget owns composition.
- `data` and `providers` remain absent until a real integration requires them.
