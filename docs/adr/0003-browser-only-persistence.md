# ADR-0003: Browser-only persistence

- **Status:** Accepted
- **Date:** 2026-08-08

## Context

Visitors use the converter without accounts and may paste confidential content. The accepted spec excludes server-side documents, cross-device sync, and version history from the MVP.

## Decision

Persist only the latest Markdown in the current browser profile behind a typed adapter. Save completed input within the spec's autosave window. If persistent storage is unavailable, fall back to tab-scoped session state and show a persistent warning. Provide explicit clearing. Introduce no database or migration tool.

## Alternatives considered

- Server-side anonymous storage would create retention, deletion, and unauthorized-access obligations.
- No persistence would make refresh and return visits lose work, contradicting the accepted user story.

## Consequences

- Drafts do not synchronize across devices or browser profiles.
- Clearing browser data may remove the draft outside the application's control.
- Version history requires a later decision and likely feature reclassification.
