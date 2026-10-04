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

To run through Vercel locally instead, use `npm run dev:full`
(`vercel dev --local-config vercel-dev.json`) — the config sets the dev
command to `vite --port $PORT --configLoader native` and carries only the
`/api/:path*` rewrite, so Vite serves the app itself while `/api/*`
reaches the single `api/index.ts` entrypoint.

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
set -a; source .env.local; set +a; vercel dev
```

- `vercel dev` does not always pass `.env.local` values into functions on
  its own. Sourcing the file into the environment first (the `set -a`
  line above) makes sure the API sees the same variables you do. If the
  admin keeps reporting "Server is missing ADMIN_TOKEN" or
  "Server is missing TURSO_DATABASE_URL" while the values exist in
  `.env.local`, this sourcing step was skipped.
- If `.env.local` was edited on Windows, check for CRLF line endings: a
  stray `\r` becomes part of the value (for example the token sent as
  `secret\r` never matches). Save the file with LF endings. Also use no
  spaces around the `=` (`KEY=value`, not `KEY= value`): under
  `set -a; source .env.local` a leading space becomes part of the value
  and the database login fails.
- Local development uses a libSQL file (`TURSO_DATABASE_URL=file:local.db`,
  the default). Never run the seed or dev scripts against the production
  database.
- `npm run db:seed` applies `db/schema.sql` and inserts the current static
  content. It is idempotent: tables already containing rows are skipped.
  It prints which database it targets and never prints tokens.
- `vercel dev` serves the frontend plus the `/api` functions. Plain
  `npm run dev` serves the frontend only.

### Admin

Open `/admin` and sign in with the admin token, then manage each section
with add/edit/delete. The token is verified
against `GET /api/admin/session`
on sign-in and only then stored; a wrong token, a missing server
`ADMIN_TOKEN`, and network failures each show their own message. The token
is kept in `sessionStorage` and sent as an `Authorization: Bearer` header;
only a real `401` on save signs you back out. Use the Log out button (or
close the tab) to sign out.

#### What the admin token is

There are no user accounts — the admin token is a single shared secret
that guards every write endpoint, and entering it is the whole login.
Treat it like a password, not like throwaway config:

- Set it once: a long random string in `ADMIN_TOKEN`, both in Vercel
  (project Settings → Environment Variables, for Production, Preview,
  and Development) and in your local `.env.local`.
- You do **not** need to regenerate it for every session. Sign in once
  per browser tab; the token stays there until you log out, close the
  tab, or it gets rejected by the server.
- Rotate it only if it leaks: pick a new value, update it in Vercel and
  locally, redeploy, and sign in again. Old browser sessions stop
  working on their next save.
- If sign-in keeps failing with a token you just copied, check the
  usual suspects in order: the server actually has `ADMIN_TOKEN` set
  (the sign-in error says so when it is missing), you sourced
  `.env.local` before `vercel dev` (see above), the file uses LF line
  endings, and there is no leading or trailing whitespace in the value.

Tip: tapping the footer's © year five times within three seconds also takes
you to `/admin`.

### Images

Project thumbnails, certification images, and hero portrait states are plain
URL strings: either an uploaded `/api/images/<id>` URL or any external
`https://…` URL. A missing or broken image shows a neutral placeholder.

In the admin, each image field offers a file upload with drag-to-crop and
zoom plus a plain URL input. Crops are re-encoded to WebP: 16:9 capped at
1280 px wide for project thumbnails, 21:9 capped at 1280 px for certification
images, square capped at 900 px for portraits, badge images square. Upload
input accepts WebP, JPEG, PNG, and AVIF. Anything that cannot fit under
400 KB is rejected, as are non-image files and SVGs (server-side too).

### Files (PDFs)

Resumes and certificate PDFs live in the `files` table (`POST /api/files`,
admin, PDF signature verified, 2 MB cap). The admin PDF control uploads a
file or accepts an external link, shows the filename and size, and supports
Replace and Remove. Removing an uploaded file deletes its row server-side.

### Content pages

- **Certifications** support one level of child courses (`parent_id`),
  certificate PDFs, small badge images with links, and per-certificate
  Verify buttons. Deleting a program deletes its courses and their uploads.
- **Resume** is managed in its own admin section (upload, link, remove).
  An empty resume hides the public Resume button; the button opens the file
  in a new tab with a separate Download link.
- **Stack** is a flat list of categorized items (`language`, `framework`,
  `library`, `database`, `tool`) with text levels (`learning`,
  `comfortable`, `confident`), an optional since-year, and a core flag. The
  old grouped `stack` table stays in the database but is no longer used.
- **Projects** carry access states (public/private source, public/internal/
  offline/no-demo demo, auto-derived from URLs when unset) shown as an
  access ledger, plus optional case studies with screenshot galleries.

### API routing

The Hobby plan allows 12 serverless functions, so there are exactly two:
`api/index.ts` (all CRUD) and `api/github/contributions.ts` (standalone).
A filename catch-all (`api/[...path].ts`) is unreliable outside Next.js,
so the entrypoint is reached through an explicit rewrite. `vercel.json`
lists, in order:

1. `/api/:path*` → `/api?__path=:path*` (the router reads `__path`,
   then deletes it before dispatch)
2. `/((?!api/).*)` → `/index.html` (SPA fallback, never captures `/api/`)

Never add new files under `api/` (except `_`-prefixed directories). Add
new endpoints as routes in the router.

### Deployment (Vercel, one-time)

1. Create a Turso database and obtain its URL and auth token.
2. In the Vercel project settings, set `TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN`, `ADMIN_TOKEN`, `GITHUB_TOKEN`, and `GITHUB_USERNAME`.
   Set them for Development (used by `vercel dev` when it pulls env),
   Preview (deploy previews), and Production as needed; at minimum
   Production and Development must each have all five.
3. For a fresh database, apply `db/schema.sql` and run the seed (from your
   own machine, never from an agent session):
   `TURSO_DATABASE_URL=<url> TURSO_AUTH_TOKEN=<token> npm run db:seed`.
4. For a database created before the images feature, apply the one-time
   migration instead (it also clears the legacy thumbnail keys):
   `turso db shell portfolio < db/migrations/0001_content_images.sql`.
   New profile and image columns stay empty until edited in `/admin`; the
   public site falls back to the static content meanwhile.
5. For a database created before the content-pages feature, apply its
   one-time migration (run exactly once):
   `turso db shell portfolio < db/migrations/0002_content_pages.sql`.
   Then fill the new flat stack table:
   `TURSO_DATABASE_URL=<url> TURSO_AUTH_TOKEN=<token> npm run db:seed`
   (existing tables are skipped, only `stack_items` is filled).
6. Redeploy so the functions pick up the new tables.

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the Vite dev server on port 4975         |
| `npm run build`     | Type-check and build for production            |
| `npm run preview`   | Preview the production build locally           |
| `npm run lint`      | Run ESLint                                     |
| `npm run db:seed`   | Apply schema and seed the database             |
| `npm run test:api`  | API suite (`tests/`, node:test via tsx, isolated local file) |

All Vite commands use `--configLoader native`, which loads the config with
Node's runtime instead of bundling it with Rolldown. This is required on
Windows, where the default Rolldown config loader fails to resolve
`vite.config.ts`.

## Structure

```
api/index.ts          Single catch-all function routing all CRUD (Hobby limit: 12 functions)
api/github/           GitHub contributions function (standalone, wins over catch-all)
api/_lib/             Shared server code (database client, admin auth, validation)
api/_routes/          Handler logic per resource (underscore-prefixed, not deployed)
db/                   SQL schema and seed script
```
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