---
status: Accepted
owner: "Architect / Tech Lead"
reviewers: ["Tech Lead"]
updated_at: "2026-08-08"
feature_size: "S"
ticket: "markdown-to-html"
---

# 0003 — Gate copying with revision-matched conversion results

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Architect / Tech Lead and Product Owner

## Context

Live input, composition completion, output-mode changes, and conversion work can overlap. Copying stale output would violate the central user promise even when the displayed result catches up shortly afterward.

## Decision drivers

- Conversion p95 ≤100 ms for documents up to 100,000 Unicode code points.
- Copy correctness must be 100% for successful copy operations.
- Documents above the boundary must remain editable while stale output cannot be copied.

## Considered options

1. **Revision-match on the main thread first** — tag requests and results, gate copy on an exact match, and add a worker only when measured.
2. **Dedicated Web Worker from the start** — isolate all parsing but pay serialization, bundling, and test complexity immediately.
3. **Debounced unversioned conversion** — reduce work by delaying conversion but coordinate freshness through timers and UI flags.

## Decision outcome

**Chosen: Revision-match on the main thread first.** Explicit revisions prove freshness independently of scheduling, while performance evidence—not prediction—decides whether worker isolation is necessary.

## Consequences

**Positive**
- Stale results cannot enable copying.
- The initial implementation avoids worker protocol complexity.

**Negative**
- Boundary-sized synchronous conversion may briefly occupy the main thread.
- Every result consumer must respect revision and output-mode identity.

**Neutral**
- A future worker can preserve the same request/result contract.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4
- Related ADR: [[0002-derive-every-output-from-one-sanitized-conversion-result]]
