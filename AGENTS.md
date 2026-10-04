# Portfolio_DevStudio

Personal developer portfolio. Vite + React + TypeScript, React Query, React Router, deployed on Vercel (free tier). Public pages are read-only for visitors; content is managed through a private admin page.

## Commands
- `npm run dev`: Vite dev server (frontend only)
- `vercel dev`: frontend plus `/api` serverless functions (use this for anything touching the database)
- `npm run build`: type-check (`tsc -b`) and production build
- `npx tsc --noEmit`: quick type-check
- `npm run test:api`: API suite (`tests/`, node:test via tsx, isolated local file)

Every commit must pass type-check and build.

## Structure
- `src/app/`: router and providers
- `src/pages/`: route-level composition only
- `src/components/<domain>/`: feature folders, each with an `index.ts` barrel (layout, navigation, hero, github, projects, experience, stack, certifications, time, contact, typography, ui)
- `src/services/<domain>/`: fetch functions that call `/api`
- `src/hooks/<domain>/`: React Query hooks that wrap services
- `src/context/`: theme context
- `src/constants/`: static content (fallback data, navigation, profile, social links)
- `api/`: Vercel serverless functions. `api/github/contributions.ts` is the reference handler style (Web-standard `GET()` export)
- `api/_lib/`: shared server code (database client, admin auth, validation)
- `db/`: SQL schema and seed script

Data flow: `api/` handler, then `services/`, then `hooks/` (React Query), then section components, then presentational components. Keep this direction one-way; no cross-domain imports except shared `layout` and `ui`.

## Content model
- **CRUD content:** projects, experience, stack items, certifications, profile, social links (Turso/libSQL). The old `stack` group table stays in the database unused; the Stack page reads `stack_items`.
- **Static content:** navigation.
- **Profile** is a single record (`profile` row 1): `GET` reads it, `PUT` (admin) upserts it. No `POST` or `DELETE`. It also holds JSON text for portrait states, hero stats, "also true" items, contact copy, and the footer note; a `null` field falls back to the static default. `resume` is a URL string (uploaded `/api/files/<id>` or `https://…`); empty hides the Resume button.
- **Social link icons** are stored as portable keys (`github`, `linkedin`, `email`) and resolved to bundled icons client-side. Project thumbnails and certification images are plain URL strings (`/api/images/<id>` or `https://…`); a missing or broken image shows the neutral `ContentImage` placeholder.
- **Images** live in the `images` table: `POST /api/images` (admin, WebP/JPEG/PNG/AVIF input, 400 KB cap, cropped output re-encoded to WebP) returns `{ id, url }`; public `GET /api/images/<id>` serves immutable bytes with `s-maxage`. Replacing, clearing, or deleting an owner row deletes its orphaned image row server-side.
- **Files** live in the `files` table: `POST /api/files` (admin, PDF only verified by `%PDF-` signature, 2 MB cap, sanitized filename) returns `{ id, url, filename, size }`; public `GET /api/files/<id>` serves inline PDFs with the stored filename. Same orphan cleanup as images.
- **Certifications** support one level of children (`parent_id`, validated, cascade delete with blob cleanup), PDFs, badge images/links, and verify links.
- **Projects** carry nullable access states (`source_access`, `demo_access`, derived from URLs when null), an access note, and an optional case study (`has_case_study`, problem/role/solution/result text, screenshot list).
- Public `GET` endpoints are open and cached; `POST`, `PUT`, and `DELETE` require `Authorization: Bearer <ADMIN_TOKEN>`, checked server-side.
- If an API request fails (network or 5xx), public pages fall back to the static constants. An empty successful response shows an empty state, not the fallback.
- Schema changes ship twice: `db/schema.sql` for fresh databases plus a one-time file under `db/migrations/` for the existing remote database.

## Environment variables
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_TOKEN`, `GITHUB_TOKEN`, `GITHUB_USERNAME`
- Secrets never use the `VITE_` prefix (it ships to the browser) and never appear in `src/`.
- Never read, print, or commit `.env*` files or database files. Document variables in `.env.example` only.
- Local development uses `file:local.db`. Never run against a remote or production database from an agent session.

## Code standards
- Senior-level, conventional, readable. Simple and direct over clever.
- Intention-revealing names; small, focused functions and components with a single responsibility.
- No clever one-liners, deep nesting, long chains, or complex regex.
- No premature abstraction: extract shared code only when it appears a third time and the result is clearly simpler. No generic CRUD factories, base classes, or config-driven forms.
- Proportional architecture: no new layers, libraries, or patterns without a clear, immediate benefit.
- SQL is always parameterized. Validate request bodies with zod in a simple, readable way.
- Handlers return JSON with correct status codes (200, 201, 204, 400, 401, 404).
- UI states: always handle loading, empty, and error.
- Preserve existing behavior and visual output unless a change is required for correctness.
- Do not touch unrelated code. Leave working code alone.

## Git
- Conventional Commits: `type(scope): subject`. Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `build`, `perf`.
- One logical change per commit; imperative, lowercase subject, 72 characters max, no trailing period.
- Work on a branch; never commit directly to `main`. Do not push unless asked.
- No AI or co-author trailers.

## Design
- Glassmorphism theme with design tokens in `src/index.css`; reuse tokens instead of hard-coded colors.
- Mobile navigation and responsive layouts must keep working.
- Do not change the theme, layout, time-of-day logic, or GitHub activity components unless the task is about them.