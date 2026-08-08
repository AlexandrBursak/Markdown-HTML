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

The committed approach is a no-login flow from Markdown supporting the full official GitHub Flavored Markdown (GFM) syntax to synchronized preview and copyable HTML, with explicit sanitization feedback. Visitors can choose an HTML fragment or a strictly minimal full document. The latest Markdown is retained only in the current browser until the Visitor clears it or browser data is removed. This keeps the interaction focused while addressing the sharpest risks: unsafe active content, private-text retention, and disagreement between preview and copied output.

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

**Given** the Markdown contains any official GFM construct, including tables, task lists, strikethrough, or fenced code blocks\
**When** the Visitor views the conversion result  
**Then** every official GFM construct follows GFM semantics in both preview and generated HTML

### AC-03 (US-03) — domain invariant

**Given** a conversion result is visible  
**When** the Visitor compares the preview with the generated HTML  
**Then** the preview is rendered from the same normalized sanitized structure represented by the generated HTML, with only presentation styling allowed to differ

### AC-04 (US-04) — happy

**Given** the generated HTML reflects the latest Markdown  
**When** the Visitor chooses to copy it  
**Then** the complete current result is copied in one action so that pasting into a plain-text destination yields the literal HTML source and pasting into a compatible rich-text destination yields the formatted HTML content, and the Visitor sees confirmation only after the browser confirms success

### AC-04b (US-04) — error

**Given** the current generated HTML is visible  
**When** the Visitor attempts to copy it but browser access is denied or fails  
**Then** the Visitor sees that copying failed, focus moves to the existing HTML panel, and that panel allows the complete HTML source to be selected manually without opening a separate fallback view

### AC-05 (US-05) — error

**Given** the Markdown contains unsafe elements, attributes, or link behavior  
**When** the content is converted  
**Then** unsafe behavior cannot execute and the Visitor sees a total transformation count plus expandable details grouped by removal or change type, with the position of every transformed occurrence and no excerpt of the input content

### AC-05b (US-05) — domain invariant

**Given** the Markdown input contains raw HTML  
**When** the content is converted  
**Then** the raw HTML is escaped and shown as ordinary text, cannot add behavior or structure to the result, and every occurrence is counted and positioned under a separate escaped-raw-HTML category in the sanitization notice

### AC-06 (US-06) — cross-context

**Given** a Visitor previously entered Markdown in the same browser  
**When** the Visitor returns to the converter  
**Then** the most recently saved Markdown is restored from the browser profile's local storage and converted automatically, except that an abrupt close may omit changes still inside the defined autosave window; private browsing does not guarantee restoration after the tab closes

### AC-07 (US-06) — authorization

**Given** Markdown was saved in one browser profile  
**When** someone opens the converter from another browser or profile  
**Then** the saved Markdown is unavailable because no server-side identity or shared document exists

### AC-08 (US-07) — happy

**Given** Markdown is saved in the current browser  
**When** the Visitor clears the saved content  
**Then** the input, the browser profile's locally stored copy, and any session-only copy held by the current tab are removed and do not return after reopening the converter

### AC-09 (US-08) — happy

**Given** a current sanitized result exists  
**When** the Visitor chooses fragment mode or full-document mode  
**Then** fragment mode, which is the default, exposes only the converted content, while full-document mode wraps that same content using only a document declaration, `html`, `head`, UTF-8 metadata, responsive viewport metadata, the stable title `Markdown Preview`, and `body`; it adds no styles, scripts, other metadata, or optional attributes, and copying remains unavailable until the displayed output reflects the selected mode

### AC-10 (US-01) — error

**Given** the Markdown input exceeds 100,000 Unicode code points\
**When** conversion continues beyond the guaranteed latency range  
**Then** the Visitor sees a size warning, can continue editing, and cannot copy until the displayed result reflects the current input and output mode

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Live conversion latency | p95 ≤100 ms for documents up to 100,000 Unicode code points; larger documents continue with no conversion-latency guarantee and a visible warning | Automated browser performance test across boundary sizes counted as Unicode code points |
| Initial usability | p95 ≤2 s with cold cache on a 4-core, 4 GB mobile profile over 10 Mbps downlink and 100 ms network latency; measured until input is available and both output panels are initialized | Synthetic browser test |
| Copy correctness | 100% of successful copy operations contain the current visible sanitized HTML as both literal source and rich HTML | Integration test with sequential editing, mode switching, and copying |
| Draft recovery | Latest input older than 500 ms is restored from `localStorage` in normal browsing mode; any storage write failure produces retention only in current-tab memory and a persistent warning | Browser integration test in normal mode across the browser support matrix, plus private-mode and forced-storage-failure cases |
| Sanitization safety | 100% of known unsafe fixtures execute no active content in preview or copied HTML | Security regression suite |
| Accessibility | All primary actions work from the keyboard; zero critical or serious violations | Automated accessibility scan and keyboard smoke test |

## 6.1 Security / privacy

- **Data classification:** confidential — Visitors may paste private or sensitive text even though the converter does not request it.
- **Personal data touched:** none intentionally collected; Markdown content may incidentally contain personal data and remains only in the Visitor's browser.
- **AuthZ/AuthN impact:** none — the feature has no accounts, shared documents, or server-side identity boundary.
- **Browser support:** the two latest major versions of Chrome, Firefox, Safari, and Edge on desktop, plus Chrome Android and Safari iOS.
- **Persistence:** completed input is saved to `localStorage` within 500 ms of the latest change and remains until Clear or browser-data removal. When a storage write is unavailable or fails, the input remains only in current-tab memory and a warning stays visible. Private browsing does not guarantee restoration after the tab closes. Clear removes the input and every retained copy in both storage layers.
- **Output safety policy:** raw HTML input is escaped and shown as ordinary text. Output structure comes only from supported GFM constructs. Links permit absolute `https`, `http`, and `mailto` destinations plus relative URLs; images permit `https` and relative sources. Other schemes, active attributes, and embedded content are removed while visible label or alternative text is retained when safe. Every transformation appears in the sanitization notice. Preview, displayed HTML, and copied rich HTML derive from the same sanitized structure.
- **Telemetry policy:** production must emit outcome-only anonymous events containing only the approved subset of session start, input presence, document-size bucket, preview timing, output mode, sanitization category/count, copy outcome, and elapsed time required to measure §7. Events must never contain Markdown, generated HTML, sanitization excerpts, clipboard content, document URLs, or a persistent user/device identifier. The random session identifier lasts only for the current tab and raw events are retained for at most 90 days. Production launch is blocked until the telemetry provider and its approved event subset pass privacy review.
- **Abuse cases:**
  - Active content embedded through elements, attributes, or links must not execute in preview or copied HTML.
  - Sanitization must not silently remove visible meaning; the Visitor receives a clear change notice.
  - Markdown above 100,000 Unicode code points continues converting without a latency guarantee, shows a size warning, and cannot be copied while its output is stale.
  - Saved Markdown must remain isolated to the current browser profile and be removable by the Visitor.
- **Security review:** Required because user-controlled content is rendered and copied as HTML.

## 7. Metrics / KPIs

- **Completed conversion rate** — baseline: 0; target: at least 70% of sessions with Markdown input end in a successful HTML copy within 30 days.
- **Time to copied result** — baseline: 0; target: median ≤60 seconds from first input to successful copy within 30 days.
- **Copy reliability** — baseline: 0; target: at least 99% of copy attempts report confirmed success within 30 days.
- **Security incidents** — baseline: 0; target: zero confirmed cases of active content executing through preview or copied HTML during the first 90 days.

## 8. Open questions

- [ ] Should a later phase add local version history, and what restoration, retention, and deletion rules would apply? Default now: latest draft only, with no history. — owner: Product Owner, due: before specifying version history
- [ ] Which telemetry provider and exact privacy-reviewed subset of the allowed outcome events will production use? Default now: no production launch until a provider and event subset are approved. — owner: Product Owner + Tech Lead, due: before production launch
- [ ] Add a copied-output security regression that runs every unsafe fixture through both clipboard representations and verifies the rich payload cannot execute active content in an isolated document. This proof is deferred from the current implementation review but remains required before production launch. — owner: Tech Lead, due: before production launch
- [ ] Add browser coverage for the real clipboard capability, verifying literal and rich representations where the browser supports access and the selectable-panel fallback where it does not. This capability proof is deferred from the current implementation review but remains required before production launch. — owner: Tech Lead, due: before production launch
- [ ] Add isolated browser-context coverage for profile-storage access and write failures, persistent tab-only warnings, runtime-only recovery, and the documented private-browsing limitation. This recovery proof is deferred from the current implementation review but remains required before production launch. — owner: Tech Lead, due: before production launch

## Test plan

### AC coverage

| AC (spec.md §5) | Test name (intent-based) | Level | Expected outcome |
|---|---|---|---|
| AC-01 | completed input and composition update both outputs | component + e2e-through-UI | Preview and displayed HTML update automatically from the completed current input. |
| AC-02 | official GFM constructs retain their semantics | unit + component + e2e-through-UI | Every supported construct has matching semantics in preview and generated HTML. |
| AC-03 | preview and source share one sanitized result | unit + component | Preview and displayed HTML represent the same normalized sanitized structure, apart from presentation styling. |
| AC-04 | successful copy contains the complete current result | integration + e2e-through-UI | A confirmed write contains the current literal and rich HTML, and confirmation appears only after success. |
| AC-04b | denied clipboard access exposes the selectable source | integration + component + e2e-through-UI | Failure is announced, focus moves to the existing HTML panel, and its complete source can be selected manually. |
| AC-05 | unsafe behavior is blocked and reported without excerpts | unit + component + e2e-through-UI | No active behavior executes; counts, grouped transformation details, and occurrence positions are shown without input excerpts. |
| AC-05b | raw HTML is escaped and reported separately | unit + component + e2e-through-UI | Raw HTML appears only as text, cannot affect structure or behavior, and each occurrence is categorized and positioned. |
| AC-06 | the latest eligible local draft is restored | integration + e2e-through-UI | The latest input outside the autosave window is restored and converted in the same browser profile, subject to the documented private-mode limit. |
| AC-07 | a retained draft stays inside its browser profile | integration + e2e-through-UI | A different browser or profile cannot access the saved Markdown because no shared identity or server copy exists. |
| AC-08 | clear removes every retained draft copy | integration + e2e-through-UI | Input, profile storage, and current-tab memory are empty and the draft does not return after reopening. |
| AC-09 | each output mode is exact and copy waits for freshness | unit + component + e2e-through-UI | Fragment is the default and contains only converted content; the full document contains exactly the required wrapper; copy remains unavailable while mode output is stale. |
| AC-10 | oversized input warns without blocking editing | unit + component + e2e-through-UI | Input beyond 100,000 Unicode code points remains editable, shows a size warning, and cannot be copied while output is stale. |

### Edge cases / error paths

- An input event arrives during character composition → expected: no intermediate composition state is treated as the completed current input.
- Clipboard access is denied or the write fails → expected: failure is announced, no success confirmation appears, and focus moves to the selectable HTML panel.
- An unsafe element, attribute, embedded object, or disallowed URL scheme is supplied → expected: active behavior cannot execute and every transformation is reported by category and position without content excerpts.
- Raw HTML appears repeatedly or is malformed → expected: every occurrence is escaped as text, counted, and positioned in the separate raw-HTML category.
- Browser profile storage is unavailable, a write fails, or private browsing discards it → expected: the latest input remains only in current-tab memory and a persistent warning explains the retention limit.
- A draft exists in another browser profile → expected: the current profile starts without that draft and makes no cross-profile request.
- Removing profile storage fails during Clear → expected: the failure remains visible and the application does not claim that all retained content was removed.
- Input or output mode changes while conversion is pending → expected: an older result is not accepted and copy stays unavailable until revision and mode both match.
- Input crosses 100,000 Unicode code points in either direction → expected: the warning and copy eligibility follow the current code-point count, not byte or code-unit length.

### Test data and isolation

- Use synthetic fixtures spanning every official GFM construct, safe and unsafe URL forms, raw HTML, Unicode boundary documents, and clipboard representations; fixture text must not resemble personal data.
- Exercise browser storage and clipboard boundaries through ephemeral per-test browser contexts with the real browser capabilities they own; do not replace browser profile storage with a mocked datastore for integration coverage.
- Start each test with a fresh browser context and clear profile storage plus current-tab state after each test so profiles, clipboard outcomes, and drafts cannot leak between cases.

### NFR validation

- Live conversion latency (`p95 ≤100 ms`): process one completed input every 250 ms for 10 minutes at representative sizes through 100,000 Unicode code points; assert conversion latency p95 remains at or below 100 ms.
- Initial usability (`p95 ≤2 s`): perform 30 cold-cache loads over 30 minutes using the specified mobile and network profile; assert p95 time until input and both output panels are ready remains at or below 2 seconds.
- Copy correctness (`100%`): repeat sequential edits, mode switches, and confirmed copies for 10 minutes; assert every successful copy matches the current visible sanitized HTML in both representations.
- Draft recovery (`500 ms`): save values immediately before, at, and after the autosave boundary in isolated browser profiles; assert eligible input is restored, while forced write failure retains only current-tab memory and keeps the warning visible.
- Sanitization safety (`100%`): run every known unsafe fixture through preview and copied output; assert none executes active content.
- Accessibility (`zero critical or serious violations`): inspect the initialized and populated converter states and drive every primary action by keyboard; assert no critical or serious violation and no keyboard-blocked action.

### CI placement

- On every PR: unit, component, and integration coverage, including sanitization, serializers, storage, and clipboard failure behavior.
- On pre-release and scheduled runs: e2e-through-UI coverage across the browser support matrix plus the heavier performance, cold-load, security, and accessibility scenarios.
