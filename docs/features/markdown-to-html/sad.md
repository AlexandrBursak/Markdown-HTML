---
status: Accepted
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

### Convert and sanitize current input

```mermaid
sequenceDiagram
    autonumber
    actor U as <user>
    participant UI as <ui>
    participant S as <service>

    Note over U,S: Precondition: the converter is open and accepts browser input
    U->>UI: Complete an input or composition event
    UI->>UI: Advance the input revision and mark output stale
    UI->>S: Convert the current Markdown revision
    S->>S: Parse all supported GFM constructs
    S->>S: Escape raw HTML and sanitize unsafe behavior
    alt Unsafe or raw HTML content is transformed
        S-->>UI: Return counts, categories, and positions without input excerpts
        UI-->>U: Show synchronized safe output and expandable transformation details
    else No content requires transformation
        S-->>UI: Return the normalized sanitized result with no transformations
        UI-->>U: Show synchronized preview and displayed HTML
    end
    UI->>UI: Accept only the current revision
    alt Input is within the guaranteed size range
        UI-->>U: Make the current output eligible for copying
    else Input exceeds 100,000 Unicode code points
        UI-->>U: Show the size warning and keep copy unavailable while stale
    end
    Note over U,S: Postcondition: visible outputs share one sanitized structure for the current revision
```

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

### Select output mode and copy the current result

```mermaid
sequenceDiagram
    autonumber
    actor U as <user>
    participant UI as <ui>
    participant S as <service>
    participant X as <external-system>

    Note over U,S: Precondition: a current sanitized conversion result exists
    U->>UI: Choose fragment or full-document mode
    UI->>UI: Mark copy unavailable until the selected mode is current
    UI->>S: Serialize the sanitized result for the selected mode
    alt Fragment mode is selected
        S-->>UI: Return only the converted content
    else Full-document mode is selected
        S-->>UI: Return the strict minimal document wrapper and converted content
    end
    UI-->>U: Show the mode-matched HTML
    alt Input revision and output mode are current
        UI-->>U: Enable copy
        U->>UI: Choose Copy
        UI->>X: Write literal HTML and rich HTML together
        alt Clipboard write succeeds
            X-->>UI: Confirm the browser write
            UI-->>U: Show copy confirmation
        else Clipboard access is denied or fails
            X-->>UI: Report the clipboard failure
            UI-->>U: Show failure and focus the selectable HTML panel
        end
    else Input revision or output mode is stale
        UI-->>U: Keep copy unavailable until displayed output is current
    end
    Note over U,S: Postcondition: any successful copy matches the current visible sanitized HTML and selected mode
```

### Restore and retain the latest draft

```mermaid
sequenceDiagram
    autonumber
    actor U as <user>
    participant UI as <ui>
    participant S as <service>
    participant D as <data-store>

    Note over U,D: Precondition: browser profile storage may contain one previously completed Markdown draft
    U->>UI: Open the converter
    UI->>S: Request the latest draft for the current browser profile
    S->>D: Read the retained Markdown
    alt A retained draft exists in this browser profile
        D-->>S: Return the latest Markdown
        S-->>UI: Restore the draft
        UI->>S: Convert the restored Markdown automatically
        S-->>UI: Return the current sanitized result
        UI-->>U: Show the restored input and synchronized outputs
    else No draft exists in this browser profile
        D-->>S: Return no retained draft
        S-->>UI: Start with empty input
        UI-->>U: Show the initialized empty converter
    end
    U->>UI: Complete a later input event
    UI->>S: Retain the latest completed Markdown within the autosave window
    S->>D: Save the latest Markdown
    Note over S,D: persists latest draft for the current browser profile
    alt Browser profile storage accepts the write
        D-->>S: Confirm persistent retention
        S-->>UI: Report the draft as retained
    else Browser profile storage is unavailable or fails
        D-->>S: Report the storage failure
        S->>S: Retain the latest Markdown in current-tab memory
        S-->>UI: Report session-only retention
        UI-->>U: Show a persistent storage warning
    end
    Note over U,D: Postcondition: only the current profile or current tab can restore its latest retained draft
```

### Clear retained content

```mermaid
sequenceDiagram
    autonumber
    actor U as <user>
    participant UI as <ui>
    participant S as <service>
    participant D as <data-store>

    Note over U,D: Precondition: the current browser profile or tab retains Markdown
    U->>UI: Choose Clear
    UI->>UI: Clear the visible input and invalidate the current output
    UI->>S: Remove every retained copy for this converter
    S->>D: Delete the browser profile draft
    Note over S,D: persists removal of the latest draft
    S->>S: Delete the current-tab memory copy
    alt Both retained copies are absent
        D-->>S: Confirm no browser profile draft remains
        S-->>UI: Confirm all retained content is cleared
        UI-->>U: Show the initialized empty converter
    else Browser profile deletion fails
        D-->>S: Report the deletion failure
        S-->>UI: Report that persistent content may remain
        UI-->>U: Show a persistent clear-failure warning
    end
    Note over U,D: Postcondition: after success, reopening cannot restore the cleared Markdown
```

### Runtime coverage

| User story | Runtime flow coverage |
|---|---|
| US-01 — Convert while typing | Convert and sanitize current input |
| US-02 — Preview extended Markdown | Convert and sanitize current input |
| US-03 — Inspect generated HTML | Convert and sanitize current input |
| US-04 — Copy generated HTML | Select output mode and copy the current result |
| US-05 — Understand removed content | Convert and sanitize current input |
| US-06 — Restore my draft | Restore and retain the latest draft |
| US-07 — Clear saved content | Clear retained content |
| US-08 — Choose output form | Select output mode and copy the current result |

| Acceptance criterion | Runtime flow or branch |
|---|---|
| AC-01 | Convert flow — completed input advances the revision and updates both outputs |
| AC-02 | Convert flow — service parses all supported GFM constructs |
| AC-03 | Convert flow — postcondition requires one sanitized structure for synchronized outputs |
| AC-04 | Copy flow — current result is written as literal and rich HTML, then confirmed |
| AC-04b | Copy flow — clipboard-failure branch focuses the selectable HTML panel |
| AC-05 | Convert flow — transformation branch returns content-free counts, categories, and positions |
| AC-05b | Convert flow — raw HTML is escaped and included in transformation diagnostics |
| AC-06 | Restore flow — current-profile draft is restored and converted automatically |
| AC-07 | Restore flow — no draft in the current profile initializes an empty converter; the postcondition limits restoration to the current profile or tab |
| AC-08 | Clear flow — both storage copies are deleted and successful reopening cannot restore them |
| AC-09 | Copy flow — mode branches serialize a fragment or strict minimal document and gate copy until current |
| AC-10 | Convert flow — oversized-input branch warns and keeps copy unavailable while output is stale |

**Runtime-view notes.** The pre-existing critical-flow seed remains unchanged. It uses concrete module participants established by §5; all sequence blocks added by the `sequences` stage use only the generic UI-driven vocabulary. No flow introduces a database entity, column, index, or migration: the sole persisted value remains the browser-local latest draft defined by the existing storage adapter.

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

| # | Title | Status | Section |
|---|---|---|---|
| 0001 | Keep the route shell server-rendered around one client converter | Accepted | §4 |
| 0002 | Derive every output from one sanitized conversion result | Accepted | §4 |
| 0003 | Gate copying with revision-matched conversion results | Accepted | §4 |
| 0004 | Isolate browser persistence and telemetry behind typed adapters | Accepted | §4 |

ADR files live under `docs/features/markdown-to-html/adr/NNNN-<decision-title>.md`.

## 10. Quality requirements

**QG-1. Safety and privacy**

- **When:** Known unsafe fixtures are converted and consumed through preview or either clipboard representation.
- **Then:** 100% of known unsafe fixtures execute no active content in preview or copied HTML.
- **How verify:** Security regression suite across allowed and disallowed elements, attributes, URL schemes, images, raw HTML, and both clipboard representations.

**QG-2. Output correctness**

- **When:** Sequential editing, output-mode switching, and copying occur.
- **Then:** 100% of successful copy operations contain the current visible sanitized HTML as both literal source and rich HTML.
- **How verify:** Integration tests that also attempt copying during stale input revisions and output-mode changes.

**QG-3a. Live responsiveness**

- **When:** Documents up to 100,000 Unicode code points are converted.
- **Then:** Live conversion latency is p95 ≤100 ms.
- **How verify:** Automated browser performance tests across boundary sizes counted as Unicode code points.

**QG-3b. Initial usability**

- **When:** The application loads with cold cache on a 4-core, 4 GB mobile profile over 10 Mbps downlink and 100 ms network latency.
- **Then:** Input is available and both output panels are initialized at p95 ≤2 s.
- **How verify:** Synthetic browser test.

**QG-3c. Draft recovery**

- **When:** Input is older than 500 ms, or browser profile storage is unavailable or fails.
- **Then:** The latest input is restored from `localStorage` in normal browsing mode; any storage write failure produces retention only in current-tab memory and a persistent warning.
- **How verify:** Browser integration tests in normal mode across the browser support matrix, plus private-mode and forced-storage-failure cases.

**QG-3d. Accessibility**

- **When:** A Visitor uses the primary workflow, including copy failure, notices, output-mode switching, and Clear.
- **Then:** All primary actions work from the keyboard; zero critical or serious violations.
- **How verify:** Automated accessibility scan and keyboard smoke test.

## 11. Risks and technical debt

| Risk / debt | Severity | Mitigation | Owner |
|---|---|---|---|
| A GFM parser may not preserve the source positions needed for every sanitization transformation | High | Evaluate representative fixtures before adoption; reject dependencies that cannot support full GFM plus positional diagnostics | Tech Lead |
| Browser clipboard implementations may differ for dual `text/plain` and `text/html` writes | Medium | Test the declared browser matrix and retain the selectable-panel fallback | Tech Lead |
| Main-thread conversion may miss responsiveness targets near 100,000 code points | Medium | Run boundary tests early; preserve the revision protocol when moving conversion to a Web Worker | Tech Lead |
| Live design source and concrete product tokens are unresolved | Medium | Preserve `<!-- FILL -->` markers and avoid fabricated values until an authoritative source is approved | Product Owner |
| Telemetry provider and approved event subset are unresolved | Open question | Resolve before production launch; launch remains blocked until privacy review passes | Product Owner + Tech Lead |
| Local version history rules are unresolved | Open question | Resolve before specifying version history; MVP retains only the latest draft | Product Owner |

**Accepted debt (acceptable in v1, revisit at the stated trigger):**

- Conversion begins on the main thread; boundary performance evidence determines whether to introduce a Web Worker.
- Only the latest draft is retained; there is no local version history.
- Telemetry remains disabled until its provider and event subset are approved.
- The initial UI uses only established tokens and cannot claim fidelity to a missing design source.

## 12. Glossary

| Term | Meaning |
|---|---|
| Visitor | A person who uses the public converter without identification; not a registered user and has no server-side profile |
| GFM | The full official GitHub Flavored Markdown syntax supported by the converter |
| Sanitized conversion result | The normalized, typed structure remaining after security policy is applied; every visible and copied output derives from it |
| Transformation diagnostic | A content-free record of a removal, change, or escaped raw-HTML occurrence, including category and source position but no input excerpt |
| Fragment mode | The default output containing only converted content |
| Full-document mode | The same converted content inside the strictly minimal wrapper defined by AC-09 |
| Current result | A result whose input revision and output mode both match the Visitor's latest state |
| Browser profile storage | `localStorage` scoped to the current browser profile; not a server datastore |
| Current-tab memory | A non-persistent fallback retained only while the current tab remains alive |
| Clear | The action that removes editor input and every application-controlled copy from browser profile storage and current-tab memory |
