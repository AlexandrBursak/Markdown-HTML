---
slug: markdown-to-html
date: 2026-08-09
triage: regression
acs: [AC-10]
commit: a24fb47
recurrence_of: _fixes/2026-08-09-ci-performance-profile.md
---

# Fix: CI browser matrix remained unstable under shared-runner contention

## Symptom

After isolating the performance profile itself, GitHub's 120-test browser matrix still ran with two workers and expected a clean six-project gate. It instead reported desktop-Chrome conversion p95 values of 193 ms, 137.9 ms, and 152.8 ms, plus hydration warnings, four final interaction failures, and twelve flaky WebKit/Firefox tests.

## Root cause

The first fix prevented performance tests from overlapping each other, but Playwright could still run the hardware-sensitive profile alongside another browser project on GitHub's shared two-worker runner. Under that contention, Next.js development hydration and synchronous conversion missed their test deadlines across multiple engines. The existing pinning test did not constrain CI worker count, so the incomplete isolation passed locally.

## The pinning test

The existing `CI workflow > installs and configures the accepted desktop and mobile browser matrix` repository contract was strengthened to require `workers: process.env.CI ? 1 : undefined`. Its GOOD RED was:

> expected `playwright.config.ts` to contain `workers: process.env.CI ? 1 : undefined`

After the fix, all 20 desktop-Chrome tests passed under `CI=1`, including the conversion latency profile. Firefox, WebKit, and Edge were NON-red locally because their binaries are not installed; GitHub's workflow installs the full matrix.

## Spec patch

None — the spec was right; AC-10 and the §6 p95 ≤100 ms conversion requirement remain unchanged.

## Follow-ups

- Use the GitHub run as the authoritative six-engine result because the local workstation installs only Chrome.
