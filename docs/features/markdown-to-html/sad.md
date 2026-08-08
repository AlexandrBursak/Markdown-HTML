---
status: Draft
owner: "Architect / Tech Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-08"
feature_size: "S"
target_surfaces: [web-frontend]
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

**Technical.**

- Node.js ≥22, pnpm 11.5.2, strict TypeScript 6.x, Next.js App Router 16.3.0, and React 19.x.
- One browser-focused frontend; no backend, database, migrations, accounts, or cross-device storage.
- Server Components by default, with a narrow Client Component boundary for the interactive converter and browser APIs.

**Organisational.**

- Feature size S on the quick pipeline route.
- No authoritative deadline, person-week budget, or team composition is recorded; this SAD does not invent them.

**Conventions.**

- Follow [AGENTS.md](../../../AGENTS.md), [the architecture map](../../architecture-map.md), and the installed RexSoft frontend skill.
- Dependencies flow `app → view/data/entities/shared`, never upward. Routes stay thin; conversion and sanitization stay outside React components; browser integrations use typed adapters.
- Use CSS Modules and existing CSS custom properties. Preserve unresolved design-source and visual-token `<!-- FILL -->` markers until an authoritative source exists.

**Regulatory / external.**

- Treat entered Markdown as confidential. Raw Markdown HTML is escaped as text; preview, displayed source, and copied rich HTML share one sanitized representation.
- Keep Markdown, generated HTML, clipboard content, document URLs, and persistent identifiers out of telemetry.
- Production telemetry remains disabled until its provider and exact event subset pass privacy review.

## 3. Context and scope

The Markdown-HTML web application gives a Visitor one public, no-login workflow for converting untrusted Markdown into synchronized, sanitized preview and copyable HTML. Conversion and retention remain in the browser; the system has no backend, identity provider, document API, database, or cross-device data boundary. All Markdown is untrusted at entry, while any future telemetry boundary accepts outcome metadata only.

<!-- brownfield: the target foundation has been materialized as a minimal Next.js scaffold; converter domain, browser adapters, and product UI are not implemented yet. -->

**External systems (in / out):**

| Actor or system | Type | Interaction |
|---|---|---|
| Visitor | Person | Enters Markdown, verifies preview and HTML, selects an output mode, copies output, and clears retained content |
| Browser profile storage | Browser capability | Retains only the latest Markdown when available; may deny or fail writes |
| Privacy-approved telemetry service | External system, optional | Receives only an approved subset of outcome metadata after provider privacy review |

**C4 Context (L1):**

```mermaid
C4Context
    title Markdown-to-HTML — System Context

    Person(visitor, "Visitor", "Uses the public converter without identification")
    System(app, "Markdown-HTML web application", "Converts untrusted Markdown into synchronized sanitized preview and copyable HTML")
    System_Ext(browser_storage, "Browser profile storage", "Optionally retains only the latest Markdown in the current browser profile")
    System_Ext(telemetry, "Privacy-approved telemetry service", "Optionally receives outcome-only events after privacy review")

    Rel(visitor, app, "Enters Markdown, verifies output, copies HTML, and clears retained content", "Browser UI")
    Rel(app, browser_storage, "Saves, restores, and clears the latest Markdown", "Web Storage API")
    Rel(app, telemetry, "Sends approved outcome-only events; never document or clipboard content", "Provider adapter")
```

## 4. Solution strategy

1. **One web-frontend target surface.** The feature is one public browser experience. It introduces no backend service, worker service, mobile or desktop application, CLI, or SDK.
2. **Server-rendered shell around one client converter.** App Router owns the static route shell and metadata; a narrow Client Component owns editor state and browser interactions. Local React state is sufficient, so no global state library is introduced. See [ADR-0001](./adr/0001-keep-the-route-shell-server-rendered-around-one-client-converter.md).
3. **One canonical sanitized conversion result.** A pure typed pipeline parses full GFM while treating raw HTML as text, normalizes the structure, applies the output security policy, records content-free transformation diagnostics, and serializes every presentation from the same result. See [ADR-0002](./adr/0002-derive-every-output-from-one-sanitized-conversion-result.md).
4. **Revision-matched freshness.** Each completed input or composition event advances a revision. Preview and displayed HTML update together, while copy remains disabled until both the input revision and output mode match the latest request. Conversion begins on the browser main thread; boundary performance tests trigger a Web Worker follow-up if required. See [ADR-0003](./adr/0003-gate-copying-with-revision-matched-conversion-results.md).
5. **Typed browser integration boundaries.** Persistence owns `localStorage`, current-tab memory fallback, restoration, and clearing. A provider-neutral telemetry port defaults to disabled until privacy approval and cannot accept document or clipboard data. See [ADR-0004](./adr/0004-isolate-browser-persistence-and-telemetry-behind-typed-adapters.md).

## 5. Building block view

The feature uses the accepted layered frontend architecture. One web container owns delivery and browser execution, while pure conversion contracts, browser adapters, external telemetry integration, and product UI have distinct module ownership. Dependencies flow `app → view/data/entities/shared`; lower layers never import upward.

**Internal decomposition:**

```text
src/
├── app/
│   └── page.tsx                         thin server-rendered route composition
├── entities/conversion/
│   ├── types.ts                         revisions, modes, sanitized nodes, diagnostics
│   ├── parse.ts                         GFM parsing with raw HTML treated as text
│   ├── sanitize.ts                      URL/structure policy and transformations
│   ├── serialize.ts                     fragment and minimal-document serializers
│   └── convert.ts                       pure pipeline orchestration
├── data/telemetry/
│   ├── types.ts                         approved outcome-only event contract
│   ├── disabledTelemetry.ts             default implementation
│   └── providerAdapter.ts               added only after privacy approval
├── shared/
│   ├── browser/draftStorage.ts          localStorage plus tab-memory fallback
│   ├── browser/clipboard.ts             dual-MIME copy adapter
│   └── ui/                              domain-neutral primitives only
└── view/
    ├── components/                      editor, preview, HTML, notices, controls
    └── widgets/ConverterWidget/         interaction state and feature composition
```

The converter widget coordinates the workflow but does not implement parsing, sanitization, persistence, or clipboard policy. No application-wide provider is introduced.

**C4 Container (L2):**

```mermaid
C4Container
    title Markdown-to-HTML — Containers

    Person(visitor, "Visitor", "Uses the public converter without identification")

    Container_Boundary(product, "Markdown-HTML") {
        Container(web, "Markdown-HTML web frontend", "Next.js 16.3, React 19, TypeScript 6", "Serves the route shell and runs conversion, preview, persistence coordination, and copying in the browser")
    }

    System_Ext(browser_storage, "Browser profile storage", "Retains only the latest Markdown when available")
    System_Ext(telemetry, "Privacy-approved telemetry service", "Optionally receives approved outcome-only events")

    Rel(visitor, web, "Edits Markdown, verifies output, copies HTML, and clears retained content", "Browser UI")
    Rel(web, browser_storage, "Saves, restores, and clears the latest Markdown", "Web Storage API")
    Rel(web, telemetry, "Sends approved outcome-only events when enabled", "Provider adapter")
```

## 6. Runtime view

**Critical flow 1: Convert, retain, select output mode, and copy**

```mermaid
sequenceDiagram
    actor Visitor
    participant Widget as ConverterWidget
    participant Pipeline as ConversionPipeline
    participant Storage as DraftStorage
    participant Clipboard as ClipboardAdapter

    Visitor->>Widget: Completes an input or composition event
    Widget->>Widget: Advances the input revision and marks output stale
    par Convert current input
        Widget->>Pipeline: Converts Markdown for the current revision and mode
        Pipeline-->>Widget: Returns sanitized result and transformation diagnostics
        Widget->>Widget: Accepts only a revision-matched result and updates both outputs
    and Retain latest draft
        Widget->>Storage: Schedules the latest completed input for retention
        alt Browser profile storage succeeds
            Storage-->>Widget: Confirms persistent retention
        else Browser profile storage is unavailable or fails
            Storage-->>Widget: Retains current-tab memory and reports persistent warning
        end
    end

    Visitor->>Widget: Selects fragment or full-document mode
    Widget->>Pipeline: Serializes the sanitized result for the selected mode
    Pipeline-->>Widget: Returns mode-matched displayed HTML
    Widget-->>Visitor: Enables copy when revision and mode are current

    Visitor->>Widget: Chooses copy
    Widget->>Clipboard: Writes literal HTML and rich HTML
    alt Browser confirms clipboard success
        Clipboard-->>Widget: Confirms success
        Widget-->>Visitor: Shows copy confirmation
    else Clipboard access is denied or fails
        Clipboard-->>Widget: Reports failure
        Widget-->>Visitor: Shows failure and focuses selectable HTML panel
    end
```

The downstream `sequences` stage expands this seed so every acceptance criterion maps to a flow, branch, or explicit N/A.

## 7. Deployment view

<!-- N/A: This S-sized feature reuses the existing single non-root Docker Compose `web` service, standalone Next.js output, port 3000, healthcheck, and bounded container logs. It adds no runtime service, datastore, queue, worker, replica policy, or infrastructure scaling threshold. Browser performance and outcome monitoring belong in §8 and §10 rather than creating deployment topology. -->

## 8. Crosscutting concepts

| Concept | Convention | Where defined |
|---|---|---|
| Input trust | Treat every Markdown character as untrusted; raw HTML becomes text before it can affect structure | Spec §6.1; ADR-0002 |
| Output security | Allow structure only from supported GFM; centralize URL/image policy and content-free diagnostics in the conversion domain | Spec AC-05/AC-05b; ADR-0002 |
| Output consistency | Preview, displayed HTML, and clipboard payloads consume one revision- and mode-identified sanitized result | Spec AC-03/AC-09; ADR-0002/ADR-0003 |
| Error handling | Expected browser failures return typed results and visible recoverable states; unexpected widget/route failures use React/Next error boundaries | Architecture map; ADR-0004 |
| Persistence | Save completed input within 500 ms; fall back to current-tab memory with a persistent warning; Clear removes both copies | Spec AC-06–AC-08; ADR-0004 |
| Clipboard | Write `text/plain` and `text/html` together; confirm only after browser success; focus the selectable HTML panel on failure | Spec AC-04/AC-04b; ADR-0003 |
| Telemetry and logging | Allowlisted outcome fields only; never document, output, clipboard, URL, excerpt, or persistent identifier content | Spec §6.1; ADR-0004 |
| Accessibility | Keyboard operation and focus management are component contracts, including failure paths and notices | Spec §6 Accessibility; here |
| Internationalization | N/A for MVP because no locale or translation requirement is approved; accessible copy remains centralized for later extraction | Here |
| Authentication and IDs | N/A: no account or authorization boundary; only a random tab-scoped telemetry session identifier may exist after approval | Spec §6.1; architecture map |

## 9. Architecture decisions

<!-- Reverse index of all feature ADRs. -->

## 10. Quality requirements

<!-- Testable When/Then/How-verify scenarios using spec §6 figures verbatim. -->

## 11. Risks and technical debt

<!-- Risks, accepted debt, and every deferred decision with mandatory owner and due. -->

## 12. Glossary

<!-- Canonical domain and technical terms; feature CONTEXT wins on conflicts. -->
