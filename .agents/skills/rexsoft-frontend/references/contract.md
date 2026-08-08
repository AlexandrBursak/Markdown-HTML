# Skill: Cross-Repo API Contract (shared — READ if you touch the API boundary)

Backend and frontend live in **separate repositories**. This file is the single
description of the boundary between them. It is bundled into **both** Codex skills'
`references/`. If the contract changes, update it in `basic-skills/common/`; the
checked-in skill symlinks expose the change immediately.

## Source of truth
- The backend **OpenAPI/Swagger** spec is **canonical** for endpoints, params and types.
- The frontend generates/derives its client types from that spec; it must not invent
  shapes the spec does not describe.
- Keep the OpenAPI spec in sync with AdonisJS validators and DTOs (see the backend
  skill's `api-docs-swagger.md` reference).

## Response envelope (invariant)
Success:
```json
{ "data": {}, "meta": {} }
```
Error:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [] } }
```
- Backend **produces** the envelope: every controller/handler returns `{ data: ... }`,
  nested payloads too (`return { data: { items } }`).
- Frontend **unwraps** `body.data` in its API client (`apiRequest`). A missing envelope
  yields `undefined` client-side → blank UI. If a fetch returns nothing, check the
  envelope first.

## Sessions & authorization (invariant mechanics, project-specific values)
- Auth token is carried in an **httpOnly cookie** issued by the backend.
- Frontend **server-side** code reads it through a single session helper
  (e.g. `getAccountToken()` in `src/shared/lib/serverSession`), never by reading
  cookies ad hoc. The token stays in `server-only` modules and must not reach the
  client bundle.
- Backend validates the token + permissions in middleware.
- There may be more than one cookie with a fallback (e.g. a customer session and an
  admin token).
  <!-- FILL: session cookie name(s), e.g. `app_session ?? admin.token` -->

## Roles
- Roles + a `roleRank` privilege ladder gate access: frontend by rank
  (`AdminShell roles={[...]}` + `AdminGuard`), backend by admin middleware.
  <!-- FILL: the actual role set + ranks, e.g. customer(0) < warehouse(1) < manager(2) < admin(3) -->
