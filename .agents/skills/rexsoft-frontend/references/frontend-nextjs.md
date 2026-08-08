# Skill: Frontend Next.js

## Context
Frontend uses Next.js, TypeScript and SEO-friendly architecture.

Each project has its own design handoff reference (Figma / Claude Design / static HTML). Stay visually close to the provided mockups, shared CSS tokens and mobile references unless there is a practical implementation reason to adapt. Record the concrete source in `onboarding.md`.

## Architecture Rules
- Use App Router unless the project explicitly requires Pages Router.
- Follow `frontend-architecture.md` for frontend layers, imports, naming and module placement.
- Use Server Components by default.
- Use Client Components only when browser interactivity is required.
- Keep components small and reusable.
- Keep API access in typed client modules.
- Do not expose backend secrets in `NEXT_PUBLIC_*`.
- Use environment variables with `.env.example`.

## SEO Rules
- Use SSR or SSG for SEO-sensitive pages.
- Use `metadata` or `generateMetadata`.
- Add title, description, canonical URL and OpenGraph data.
- Add robots rules where needed.
- Generate sitemap.xml and robots.txt.
- Use structured data JSON-LD where useful.
- Avoid client-only rendering for public indexable content.

## Performance Rules
- Optimize Core Web Vitals.
- Use `next/image` for images where possible.
- Avoid unnecessary client-side JavaScript.
- Use dynamic imports for heavy client-only features.
- Cache public data carefully.
- Use loading and error states.

## API Rules
- Use typed API clients.
- Handle API errors consistently.
- Do not call private backend endpoints from client components if secrets are required.
- Prefer server-side API calls for protected or SEO-sensitive data.
- Base URL comes from `NEXT_PUBLIC_API_URL` / server-side `API_URL`; the backend is a
  separate service (see `contract.md`).
