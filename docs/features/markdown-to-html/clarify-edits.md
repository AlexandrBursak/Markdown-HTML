# Clarify edits — markdown-to-html

- conflicting-requirement · §7 / §6.1 · resolved · removed the content-dependent sanitization-transparency KPI; repeat unsafe input remains subject to the same sanitization policy
- scope-ambiguity · §1 / AC-02 · resolved · “GFM-compatible” → full official GFM syntax, with the named constructs retained as examples
- under-specified-AC · AC-04 · resolved · “literal HTML source and rich HTML” → observable plain-text and compatible rich-text paste outcomes from one copy action
- under-specified-AC · AC-04b · resolved · unspecified manual selection → focus the always-selectable existing HTML panel without a separate fallback view
- under-specified-AC · AC-05 / AC-05b · resolved · excerpt-or-position reporting → total count, category groups, and positions for every occurrence without input excerpts; raw HTML is a separate category
- under-specified-AC · AC-06 / AC-08 / §6 · resolved · unspecified persistent-storage scenarios → `localStorage`, current-tab memory fallback, private-mode limitation, persistent warning, and Clear across every retention layer
- under-specified-AC · AC-09 · resolved · loosely minimal full document → exact minimal envelope with no optional styles, scripts, metadata, or attributes
- undefined-term · AC-10 / §6 · resolved · “100 KB” → 100,000 Unicode code points
- scope-ambiguity · §6.1 / §7 · resolved+deferred · optional telemetry → mandatory production telemetry; provider and approved event subset deferred with owner and due
