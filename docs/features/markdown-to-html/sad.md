---
status: Draft
owner: "Architect / Tech Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-08"
feature_size: "S"
target_surfaces: []
---

# Software Architecture Document — markdown-to-html

<!-- 12 Arc42 sections. Empty section → N/A with a one-line reason. -->
<!-- C4 Context (L1) lives inline in §3. C4 Container (L2) lives inline in §5. -->
<!-- Numbers in §10 come verbatim from spec.md §6 NFR. -->

## 1. Introduction and goals

**Intent.** Build a public, browser-only web converter where a Visitor enters Markdown and receives a synchronized, sanitized preview and copyable HTML without an account or server-side document storage.

**Top-3 quality goals:**

1. **Safety and privacy.** Active content must never execute; document content must remain in the Visitor's browser and outside telemetry.
2. **Output correctness.** Preview, displayed HTML, and clipboard output must derive from the same normalized sanitized structure.
3. **Responsive, recoverable interaction.** Conversion must meet the specified latency target, preserve completed input locally, expose failures, and remain keyboard-accessible.

**Stakeholders.**

| Role | Interest | Sign-off owner? |
|---|---|---|
| Visitor | Converts Markdown, verifies the result, copies HTML, and controls locally retained content | No |
| Product Owner | Product intent, scope, and acceptance | Yes — product scope |
| Tech Lead | Architecture and implementation boundaries | Yes — architecture |
| Security Lead | Rendering, sanitization, clipboard, persistence, and telemetry controls | Yes — security |

<!-- Decision overrides: none. -->

## 2. Constraints

<!-- Fixed technical, organisational, convention, and regulatory/external constraints. -->

## 3. Context and scope

<!-- Business context, trust boundary, external systems, and C4 Context diagram. -->

## 4. Solution strategy

<!-- Target surface first, followed by three or four strategic choices. -->

## 5. Building block view

<!-- Internal decomposition and one C4 container per declared target surface. -->

## 6. Runtime view

<!-- At least one critical semantic sequence flow using §5 participants. -->

## 7. Deployment view

<!-- Topology, monitoring, and scaling thresholds, or reasoned N/A for S. -->

## 8. Crosscutting concepts

<!-- Cross-module security, errors, persistence, telemetry, accessibility, and related conventions. -->

## 9. Architecture decisions

<!-- Reverse index of all feature ADRs. -->

## 10. Quality requirements

<!-- Testable When/Then/How-verify scenarios using spec §6 figures verbatim. -->

## 11. Risks and technical debt

<!-- Risks, accepted debt, and every deferred decision with mandatory owner and due. -->

## 12. Glossary

<!-- Canonical domain and technical terms; feature CONTEXT wins on conflicts. -->
