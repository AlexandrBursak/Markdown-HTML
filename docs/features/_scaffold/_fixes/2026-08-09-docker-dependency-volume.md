---
slug: _scaffold
date: 2026-08-09
triage: no-spec
acs: []
commit: 87c1eef
recurrence_of: none
---

# Fix: Docker development startup aborted on a stale dependency volume

## Symptom

Running `docker compose up --build` was expected to boot the development service, but pnpm aborted its automatic `node_modules` replacement because Compose startup had no TTY. After noninteractive replacement was first enabled, the existing root-owned named volume instead failed with `EACCES` while removing `node_modules/.bin`.

## Root cause

The Compose bind mount overlays the image workspace and a persistent named volume overlays the image's `node_modules`. Rebuilding the image does not refresh or change ownership of an existing volume, while the original entrypoint immediately launched `pnpm dev` without reconciling dependency state. The packaging test checked only static Docker markers and never executed development and production entrypoint behavior.

## The pinning test

`Docker packaging > reconciles the dependency volume in development and skips installs in production` executes `docker/entrypoint.sh` with a fake pnpm binary. Before the fix its GOOD RED was:

> expected `pnpm:install --frozen-lockfile\ntarget\n`, received `target\n`

The packaging contract also requires root-owned stale volumes to be repairable and verifies that application startup is handed to the unprivileged `node` user. The real Docker proving run preserved the existing volume, repaired it, reached `healthy`, returned HTTP 200, and showed all Next.js processes running as `node`; a compatible restart reconciled dependencies in 268 ms.

## Spec patch

No spec to patch — this is the survey-generated `_scaffold`, which has task Definitions of Done rather than a feature spec. S4's existing requirement that the non-root Compose service build and boot was re-verified.

## Follow-ups

- None.
