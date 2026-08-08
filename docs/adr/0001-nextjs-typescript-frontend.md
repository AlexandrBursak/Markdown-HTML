# ADR-0001: Next.js and TypeScript frontend

- **Status:** Accepted
- **Date:** 2026-08-08

## Context

The product is a public, interactive web utility with no required backend. The team-provided RexSoft frontend baseline standardizes Next.js App Router, React, TypeScript, pnpm, and Docker Compose.

## Decision

Use Next.js App Router with React and TypeScript strict mode on Node.js LTS. Use pnpm for dependency and script execution. Package the application as one Docker Compose `web` service.

## Alternatives considered

- A framework-free static application would reduce framework weight but diverge from the accepted RexSoft operational baseline.
- A separate frontend and backend would add an unnecessary deployment and data boundary for a browser-only MVP.

## Consequences

- The interactive converter requires an explicit Client Component boundary.
- Public route metadata and the outer shell remain server-renderable.
- Framework upgrades follow supported stable releases rather than project-specific forks.
