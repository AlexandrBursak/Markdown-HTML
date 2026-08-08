---
status: Accepted
owner: "Architect / Tech Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-08"
feature_size: "S"
ticket: "markdown-to-html"
---

# 0004 — Isolate browser persistence and telemetry behind typed adapters

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Architect / Tech Lead, Product Owner, and Security Lead

## Context

Browser storage and clipboard-adjacent telemetry are unreliable or privacy-sensitive boundaries. The persistence behavior is fixed, but the telemetry provider and final approved event subset remain unresolved.

## Decision drivers

- Input older than 500 ms must restore when `localStorage` is available.
- Storage failure must retain only current-tab memory and produce a persistent warning.
- Telemetry must never receive Markdown, generated HTML, clipboard content, document URLs, or persistent identifiers.

## Considered options

1. **Typed adapters with telemetry disabled by default** — isolate browser capabilities and activate a provider only after privacy review.
2. **Widget-owned browser integrations** — wrap browser APIs directly in the converter state owner with fewer files but tighter coupling.
3. **Application-wide provider context** — expose persistence and telemetry through React context, centralizing them but widening runtime scope.

## Decision outcome

**Chosen: Typed adapters with telemetry disabled by default.** This keeps failure and privacy policy testable, prevents vendor code from entering domain logic, and makes the production-launch gate explicit.

## Consequences

**Positive**
- Browser denial and quota failures become typed visible states.
- No telemetry provider is required during core feature implementation.

**Negative**
- Adapter contracts and test doubles add a small amount of indirection.
- Provider activation requires a separate privacy-reviewed configuration change.

**Neutral**
- Current-tab fallback is runtime memory, not a second persistent store.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4
- Related ADR: [[0003-gate-copying-with-revision-matched-conversion-results]]
