---
slug: markdown-to-html
date: 2026-08-09
triage: regression
acs: [AC-10]
commit: 41c1e62
recurrence_of: none
---

# Fix: CI performance profile exceeded the conversion latency budget

## Symptom

Running the full Playwright browser matrix was expected to keep conversion latency at p95 ≤100 ms through 100,000 Unicode code points, but the desktop Chrome profile reported p95 values of 120.4 ms, 236.7 ms, and 216.5 ms across its initial run and retries. The same run emitted a React hydration-mismatch warning.

## Root cause

`tests/browser/converter-performance.spec.ts` began native textarea mutations immediately after navigation, before proving that React hydration and event handlers were complete, so hydration and JIT work could enter the measured samples and the DOM could change while React reconciled it. Playwright's fully parallel configuration also allowed the conversion profile to overlap the CPU-throttled cold-load profile and repeated hardware-sensitive measurements across every browser project. The short smoke previously collected roughly ten samples, which made its calculated p95 effectively the maximum observation.

## The pinning test

`CI workflow > isolates performance profiles and hydrates the converter before sampling` is a unit-level repository contract in `tests/unit/ciWorkflow.test.ts`. Before the fix it failed at line 69 with:

> AssertionError: expected performance test source to contain `test.describe.configure({ mode: "serial" })`

The test now requires serial performance profiles, the canonical `desktop-chrome` project, and a completed untimed warm-up conversion before sampling.

## Spec patch

None — the spec was right; AC-10 and the §6 live-conversion latency NFR were re-verified without changing the p95 ≤100 ms requirement.

## Follow-ups

- Evaluate running the scheduled performance workflow against `next build && next start` so release measurements use the production server rather than the development server.
