---
status: Accepted
owner: "Architect / Tech Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-08"
feature_size: "S"
ticket: "markdown-to-html"
---

# 0002 — Derive every output from one sanitized conversion result

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Architect / Tech Lead, Product Owner, and Security Lead

## Context

The preview, displayed HTML, fragment/full-document output, and clipboard MIME types must agree while untrusted input cannot execute. Sanitization feedback also requires categories, counts, and positions without retaining excerpts.

## Decision drivers

- Preview and generated HTML must represent the same normalized sanitized structure.
- 100% of known unsafe fixtures must execute no active content.
- Raw Markdown HTML must be escaped as ordinary text and reported separately.

## Considered options

1. **Canonical typed sanitized structure** — normalize and sanitize a typed intermediate result, then derive every output from it.
2. **Canonical sanitized HTML string** — sanitize one serialized string and parse that string again for preview.
3. **Canonical render tree with an HTML serializer** — make the preview-oriented tree primary and serialize a compatible HTML representation from it.

## Decision outcome

**Chosen: Canonical typed sanitized structure.** It makes the security policy and diagnostics testable without React or the DOM while supporting deterministic serializers for every output form.

## Consequences

**Positive**
- Preview/copy equivalence is an architectural invariant.
- Security and diagnostic behavior is unit-testable as pure logic.

**Negative**
- The application owns an explicit intermediate representation and serializers.
- GFM extensions must preserve source-position metadata through normalization.

**Neutral**
- The specific standards-compliant GFM parsing dependency remains an implementation choice evaluated against this contract.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4
- Related ADR: [[0003-gate-copying-with-revision-matched-conversion-results]]
