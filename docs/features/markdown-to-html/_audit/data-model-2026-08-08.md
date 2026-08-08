---
status: complete
owner: "Backend Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-08-08"
feature_size: "S"
---

# Data-model audit — markdown-to-html

## Outcome

The feature touches one logical browser-storage record, `latest_draft`, but introduces no database schema change. The accepted architecture requires browser-only persistence through a typed adapter and explicitly excludes a backend, database, migration tool, server-side document identity, and cross-device persistence.

## Convention sources

| Source | Finding |
|---|---|
| `docs/architecture-map.md` | Datastore and migrations are `none`; no migration tool or persisted domain IDs exist |
| `docs/adr/0003-browser-only-persistence.md` | Only the latest Markdown may persist in the current browser profile; no database or migration tool may be introduced |
| `docs/features/markdown-to-html/sad.md` §4, §5, §6, §8 | `DraftStorage` owns `localStorage` plus current-tab fallback; restore, replace, and clear are direct key operations; no runtime flow introduces a database entity, column, index, or migration |
| Accepted feature ADR 0004 | Browser persistence remains behind a typed adapter, while current-tab fallback is runtime memory rather than another persistent store |

## Aggregate and access-pattern audit

- Aggregate root: `latest_draft`, a single logical browser-storage value.
- Owned data: the latest completed Markdown input only.
- Reads: restore by the adapter's well-known storage key when the converter opens.
- Writes: replace the value within the 500 ms autosave window after completed input.
- Deletes: remove the browser-profile value and current-tab fallback when the Visitor chooses Clear.
- Index candidates: none. Web Storage already addresses the value directly by key; no application-defined database index is applicable.

## Staged migrations

None. There is no schema change, so `docs/features/markdown-to-html/migrations/` contains no migration pair.

Migrations are staged — not yet in the live `migrations/` tree; `implement` promotes them. In this run there is nothing to stage or promote.

## Promote-time convention hint

N/A. The repository has no live migrations tree, database schema, migration tool, or numbering convention. Introducing one would contradict the accepted browser-only persistence ADR and requires a new architecture decision.

## Seeds and fixtures

- Bootstrap seeds: none.
- Lookup seeds: none.
- Test fixtures: use a browser-storage adapter harness with synthetic Markdown; no fixtures belong in migrations.
- PII guard: no seed data was generated, and future test content must remain synthetic.

## Drift detection

No database/domain drift exists to compare. The repository currently contains only the frontend scaffold and has not yet materialized `src/entities/conversion/` or `src/shared/browser/draftStorage.ts`; those are planned implementation modules, not missing database columns. No `_drift/` migration is proposed.

## Structural self-check

| Check | Result | Evidence |
|---|---|---|
| Naming matches repository conventions | PASS | `latest_draft` is documented as a logical adapter record; no SQL identifier convention is invented |
| Down reversibility | PASS | No forward migration or schema mutation exists, so no rollback pair is required |
| FK indexes | PASS | No foreign keys or relational entities exist |
| Convention adherence | PASS | The model preserves browser-only persistence and introduces no database philosophy or tooling |

Mermaid validation passed by structural lint: one matched `erDiagram` fence, one declared entity, valid `type name` attributes, valid `UK` key syntax, and no placeholders or relationships.

## Deviations, breaking changes, and unresolved items

- Convention deviations: none.
- Breaking-change decompositions: none.
- Unresolved template markers: none.
- Live migration files written: none.
- Upstream status note: `spec.md` remains `status: Draft` while `sad.md` and the feature ADRs are Accepted. Both mandatory artifacts exist and agree on browser-only persistence, so this does not change the model outcome; the status should be reconciled at the next review gate.

## Next-stage assessment

The feature exposes no endpoint, event, CLI command, or public service signature. On the quick route, the API stage is therefore N/A and can be auto-skipped in favor of `/sdd:tasks markdown-to-html`.
