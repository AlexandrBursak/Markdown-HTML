# Skill: Frontend Onboarding & Conventions (READ FIRST)

Frontend repo (Next.js App Router). Shared git/language rules:
`git-and-language.md`. The cross-repo API contract: `contract.md`.

## 0. Golden path (first hour)
- Runs in **Docker Compose** (`web` service). Backend is a separate service — set
  `API_URL` / `NEXT_PUBLIC_API_URL` (`.env`).
  | Task | Command | Where |
  | --- | --- | --- |
  | Typecheck (canonical) | `docker compose exec web pnpm typecheck` | container |
  | Typecheck (fast local) | `npx tsc --noEmit` | host — container is source of truth |

## 1. API envelope — the #1 time-sink
`apiRequest` (`src/data/api.ts`) unwraps `body.data`. If a fetch returns nothing, the
backend forgot the `{ data }` envelope — see `contract.md`.

## 2. Server / client boundary (App Router)
- Server-only data modules begin with `import "server-only"` and may use tokens/secrets.
- Client components import server actions from their specific module, NOT a barrel that
  re-exports `server-only` code (leaks into the client bundle, breaks the build).
- Read the session token server-side via the session helper (e.g. `getAccountToken()` in
  `src/shared/lib/serverSession`), never ad hoc cookies. See `contract.md`.

## 3. Design system & frontend conventions
- **Live design source:** <!-- FILL: Figma / Claude Design / static HTML handoff -->.
- **Design tokens** in `src/app/globals.css` (colors + font families as CSS custom
  properties). Use tokens — never raw hex. <!-- FILL: token names -->
- **Styling = CSS Modules** per page/widget (`*.module.css`), camelCase class names.
- **Responsive breakpoints:** `≤768` (mobile), `≤1024` (tablet).
- **Accent typography:** inline-markdown (`*word*` → `<em>`) via a shared `<Markdown>`.
- **Missing images → colored placeholder tiles** with labels.

## 4. NO-FABRICATION (content rule)
Public UI renders only real, admin-editable data. Hide a section/field when its data is
empty rather than showing a fake value. Exception: explicitly-requested demo/seed content.

## 5. Visual verification (for visual changes)
1. Typecheck first (`npx tsc --noEmit` for speed).
2. Drive system Chrome via `puppeteer-core` (CDP). Gotchas:
   - Turbopack compiles lazily — wait ≥15–16s after `networkidle2` before screenshotting.
   - Authenticated views: seed a session cookie (e.g. admin impersonation) before navigating.
   - Prefer a small committed screenshot helper under the repo over scratch scripts.
