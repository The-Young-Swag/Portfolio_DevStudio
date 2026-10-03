# Ivan Harvey Rivera — Portfolio

A fast, glassmorphic single-page portfolio built with **Vite, React and
TypeScript**. Five sections (Home, Projects, Experience, Stack,
Certifications) plus a live GitHub contribution log.

## Getting started

Requires **Node.js 22.18+** (Vite 8 uses the native runtime to load
`vite.config.ts`; the dev container runs Node 24).

```bash
npm install
npm run dev
```

Open **http://localhost:4975** in your browser. The dev server is configured
for the repository's VS Code dev container (port `4975` is forwarded to the
host automatically).

To run through Vercel locally instead, use `vercel dev` — the project's
`vercel.json` sets the dev command to `vite --port $PORT --configLoader
native`.

### GitHub contribution log (optional)

The "Build log" section on the Home page reads your GitHub contribution
history through a small serverless API (`api/github/contributions.ts`). To
see real data locally, create a `.env.local` file at the project root:

```
GITHUB_TOKEN=your_personal_access_token
GITHUB_USERNAME=your_github_username
```

Without a token the section shows an error message locally; on Vercel the
route uses the configured environment variables.

## Content database (Turso/libSQL)

Projects, experience, stack, certifications, profile, and social links are
stored in a Turso (libSQL) database and managed through a private admin page
at `/admin` (unlinked, `noindex`). Public pages read from `/api` and fall
back to the static constants in `src/constants/` when a request fails.

### Local setup

```bash
cp .env.example .env.local
# edit .env.local: set ADMIN_TOKEN to a long random string
npm run db:seed
vercel dev
```

- Local development uses a libSQL file (`TURSO_DATABASE_URL=file:local.db`,
  the default). Never run the seed or dev scripts against the production
  database.
- `npm run db:seed` applies `db/schema.sql` and inserts the current static
  content. It is idempotent: tables already containing rows are skipped.
- `vercel dev` serves the frontend plus the `/api` functions. Plain
  `npm run dev` serves the frontend only.

### Admin

Open `/admin`, enter the `ADMIN_TOKEN`, and manage each section with
add/edit/delete (profile is a single edit form). The token is kept in
`sessionStorage` and sent as an `Authorization: Bearer` header; a `401`
signs you back out.

### Deployment (Vercel, one-time)

1. Create a Turso database and obtain its URL and auth token.
2. In the Vercel project settings, set `TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN`, `ADMIN_TOKEN`, `GITHUB_TOKEN`, and `GITHUB_USERNAME`.
3. Against that database **once** (from your own machine, never from an
   agent session), apply `db/schema.sql` and run the seed:
   `TURSO_DATABASE_URL=<url> TURSO_AUTH_TOKEN=<token> npm run db:seed`.
4. Redeploy so the functions pick up the new tables.

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the Vite dev server on port 4975         |
| `npm run build`     | Type-check and build for production            |
| `npm run preview`   | Preview the production build locally           |
| `npm run lint`      | Run ESLint                                     |
| `npm run db:seed`   | Apply schema and seed the database             |

All Vite commands use `--configLoader native`, which loads the config with
Node's runtime instead of bundling it with Rolldown. This is required on
Windows, where the default Rolldown config loader fails to resolve
`vite.config.ts`.

## Structure

```
api/                  Vercel serverless functions (content CRUD, GitHub contributions)
api/_lib/             Shared server code (database client, admin auth, validation)
db/                   SQL schema and seed script
src/app/              Routing and app providers (React Query, theme)
src/components/       Layout, navigation, hero, github, projects, …
src/constants/        Fallback content: profile, navigation, projects, stack, …
src/context/          Shared state (theme)
src/hooks/            TanStack Query hooks for the content and GitHub APIs
src/services/         Fetch functions that call `/api`
src/pages/            Route-level pages (lazy-loaded)
src/styles/           Fonts and global styles
```

## Design

Minimal, editorial, technical. Brand colors amber `#ecad0a`, blue `#209dd7`
and purple `#753991` with grays; glass panels over a fixed atmospheric
background; light and dark themes via a shared `ThemeProvider` (persisted in
`localStorage`).