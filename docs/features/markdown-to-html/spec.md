---
status: Draft
owner: "Product Owner"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-08"
feature_size: "S"
---

# Spec — markdown-to-html

> **Glossary:** [CONTEXT](./CONTEXT.md)
> **Reference module / docs / channels used:** None — only the interview and CONTEXT.

## 1. Context

Visitors need a focused web page that turns Markdown into HTML while they type. Today there is no project capability that lets a person verify the rendered result, inspect the generated HTML, and copy it from one place without creating an account.

The immediate opportunity is a small, public utility whose value is speed and predictability rather than document management. Comparable tools validate the live-editing workflow but often combine it with broader editing, publishing, or collaboration features.

The committed approach is a no-login flow from GFM-compatible Markdown input to synchronized preview and copyable HTML, with explicit sanitization feedback. Visitors can choose an HTML fragment or a minimal full document. The latest Markdown is retained only in the current browser until the Visitor clears it or browser data is removed. This keeps the interaction focused while addressing the sharpest risks: unsafe active content, private-text retention, and disagreement between preview and copied output.

## 2. Goals

- Let a Visitor move from Markdown input to a verified, copyable HTML result in one continuous interaction.
- Make extended Markdown output predictable by keeping preview and generated HTML synchronized.
- Protect Visitors from active content and silent data retention while clearly explaining sanitization and local persistence.

## 3. Non-goals

- User accounts and authentication are excluded because the initial experience must remain immediately available without registration.
- Server-side document storage and cross-device synchronization are excluded because they introduce identity, privacy, and retention obligations beyond the S scope.
- Collaboration, publishing, and export formats other than HTML are excluded because they do not support the focused conversion workflow.
- Version history is excluded from the MVP because restoration, retention, and deletion semantics require a separate scope decision.
- Custom document metadata, styles, scripts, templates, and file downloads are excluded because the full-document mode is a minimal copyable wrapper, not a publishing workflow.

## 4. User stories

### US-01: Convert while typing

**As a** Visitor  
**I want** Markdown converted as I type  
**So that** I can see the result without submitting or refreshing

### US-02: Preview extended Markdown

**As a** Visitor  
**I want** tables, task lists, strikethrough, and fenced code blocks shown in preview  
**So that** I can verify richer formatting

### US-03: Inspect generated HTML

**As a** Visitor  
**I want** to see the generated HTML beside the preview  
**So that** I understand exactly what will be copied

### US-04: Copy generated HTML

**As a** Visitor  
**I want** to copy the current HTML in one action  
**So that** I can paste it into another tool

### US-05: Understand removed content

**As a** Visitor  
**I want** to know when unsafe content was removed or changed  
**So that** sanitization does not silently alter my result

### US-06: Restore my draft

**As a** Visitor  
**I want** my latest Markdown restored in the same browser  
**So that** an accidental refresh or return visit does not lose my work

### US-07: Clear saved content

**As a** Visitor  
**I want** to clear the locally saved Markdown  
**So that** I control whether sensitive text remains on the device

### US-08: Choose output form

**As a** Visitor  
**I want** to choose between an HTML fragment and a full document  
**So that** I can copy output suited to where I will use it

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** a Visitor has opened the converter  
**When** the Visitor completes an input event, including completion of any in-progress character composition  
**Then** the preview and generated HTML update automatically to reflect that input

### AC-02 (US-02) — happy

**Given** the GFM-compatible Markdown contains tables, task lists, strikethrough, or fenced code blocks  
**When** the Visitor views the conversion result  
**Then** each supported construct follows GFM semantics in both preview and generated HTML

### AC-03 (US-03) — domain invariant

**Given** a conversion result is visible  
**When** the Visitor compares the preview with the generated HTML  
**Then** the preview is rendered from the same normalized sanitized structure represented by the generated HTML, with only presentation styling allowed to differ

### AC-04 (US-04) — happy

**Given** the generated HTML reflects the latest Markdown  
**When** the Visitor chooses to copy it  
**Then** the complete current result is copied as both literal HTML source and rich HTML, and the Visitor sees confirmation only after the browser confirms success

### AC-04b (US-04) — error

**Given** the current generated HTML is visible  
**When** the Visitor attempts to copy it but browser access is denied or fails  
**Then** the Visitor sees that copying failed and can select the complete HTML source manually

### AC-05 (US-05) — error

**Given** the Markdown contains unsafe elements, attributes, or link behavior  
**When** the content is converted  
**Then** unsafe behavior cannot execute and the Visitor sees a summary count plus expandable details grouped by removal or change type, with a safe excerpt or position for each group

### AC-05b (US-05) — domain invariant

**Given** the Markdown input contains raw HTML  
**When** the content is converted  
**Then** the raw HTML is escaped and shown as ordinary text, cannot add behavior or structure to the result, and is reported in the sanitization notice

### AC-06 (US-06) — cross-context

**Given** a Visitor previously entered Markdown in the same browser  
**When** the Visitor returns to the converter  
**Then** the most recently saved Markdown is restored and converted automatically, except that an abrupt close may omit changes still inside the defined autosave window

### AC-07 (US-06) — authorization

**Given** Markdown was saved in one browser profile  
**When** someone opens the converter from another browser or profile  
**Then** the saved Markdown is unavailable because no server-side identity or shared document exists

### AC-08 (US-07) — happy

**Given** Markdown is saved in the current browser  
**When** the Visitor clears the saved content  
**Then** the input and stored copy are removed and do not return after reopening the converter

### AC-09 (US-08) — happy

**Given** a current sanitized result exists  
**When** the Visitor chooses fragment mode or full-document mode  
**Then** fragment mode, which is the default, exposes only the converted content, while full-document mode wraps that same content with a document declaration, UTF-8 metadata, responsive viewport metadata, a stable `Markdown Preview` title, and a document body; copying remains unavailable until the displayed output reflects the selected mode

### AC-10 (US-01) — error

**Given** the Markdown input exceeds 100 KB  
**When** conversion continues beyond the guaranteed latency range  
**Then** the Visitor sees a size warning, can continue editing, and cannot copy until the displayed result reflects the current input and output mode

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Live conversion latency | p95 ≤100 ms for documents up to 100 KB; larger documents continue with no conversion-latency guarantee and a visible warning | Automated browser performance test across boundary sizes |
| Initial usability | p95 ≤2 s with cold cache on a 4-core, 4 GB mobile profile over 10 Mbps downlink and 100 ms network latency; measured until input is available and both output panels are initialized | Synthetic browser test |
| Copy correctness | 100% of successful copy operations contain the current visible sanitized HTML as both literal source and rich HTML | Integration test with sequential editing, mode switching, and copying |
| Draft recovery | Latest input older than 500 ms is restored in supported persistent-storage scenarios; storage failure produces session-only retention and a persistent warning | Browser integration test across the support matrix and storage-failure modes |
| Sanitization safety | 100% of known unsafe fixtures execute no active content in preview or copied HTML | Security regression suite |
| Accessibility | All primary actions work from the keyboard; zero critical or serious violations | Automated accessibility scan and keyboard smoke test |

## 6.1 Security / privacy

- **Data classification:** confidential — Visitors may paste private or sensitive text even though the converter does not request it.
- **Personal data touched:** none intentionally collected; Markdown content may incidentally contain personal data and remains only in the Visitor's browser.
- **AuthZ/AuthN impact:** none — the feature has no accounts, shared documents, or server-side identity boundary.
- **Browser support:** the two latest major versions of Chrome, Firefox, Safari, and Edge on desktop, plus Chrome Android and Safari iOS.
- **Persistence:** completed input is saved within 500 ms of the latest change and remains until Clear or browser-data removal. When persistent storage is unavailable, it remains only for the current tab and a warning stays visible.
- **Output safety policy:** raw HTML input is escaped and shown as ordinary text. Output structure comes only from supported GFM constructs. Links permit absolute `https`, `http`, and `mailto` destinations plus relative URLs; images permit `https` and relative sources. Other schemes, active attributes, and embedded content are removed while visible label or alternative text is retained when safe. Every transformation appears in the sanitization notice. Preview, displayed HTML, and copied rich HTML derive from the same sanitized structure.
- **Telemetry policy:** outcome-only anonymous events may contain session start, input presence, document-size bucket, preview timing, output mode, sanitization category/count, copy outcome, and elapsed time. They must never contain Markdown, generated HTML, sanitization excerpts, clipboard content, document URLs, or a persistent user/device identifier. The random session identifier lasts only for the current tab and raw events are retained for at most 90 days.
- **Abuse cases:**
  - Active content embedded through elements, attributes, or links must not execute in preview or copied HTML.
  - Sanitization must not silently remove visible meaning; the Visitor receives a clear change notice.
  - Markdown above 100 KB continues converting without a latency guarantee, shows a size warning, and cannot be copied while its output is stale.
  - Saved Markdown must remain isolated to the current browser profile and be removable by the Visitor.
- **Security review:** Required because user-controlled content is rendered and copied as HTML.

## 7. Metrics / KPIs

- **Completed conversion rate** — baseline: 0; target: at least 70% of sessions with Markdown input end in a successful HTML copy within 30 days.
- **Time to copied result** — baseline: 0; target: median ≤60 seconds from first input to successful copy within 30 days.
- **Copy reliability** — baseline: 0; target: at least 99% of copy attempts report confirmed success within 30 days.
- **Sanitization transparency** — baseline: 0; target: at least 90% of sessions where unsafe content was changed end without immediate reinsertion of the same removed fragment within 60 days.
- **Security incidents** — baseline: 0; target: zero confirmed cases of active content executing through preview or copied HTML during the first 90 days.

## 8. Open questions

- [ ] Should a later phase add local version history, and what restoration, retention, and deletion rules would apply? Default now: latest draft only, with no history. — owner: Product Owner, due: before specifying version history
