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
add/edit/delete. The profile page edits the basic fields plus the hero
portrait states, hero stats, "Also true" items, contact copy, resume, and
footer note. The token is verified against `GET /api/admin/session`
on sign-in and only then stored; a wrong token, a missing server
`ADMIN_TOKEN`, and network failures each show their own message. The token
is kept in `sessionStorage` and sent as an `Authorization: Bearer` header;
only a real `401` on save signs you back out.

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

### Deployment (Vercel, one-time)

1. Create a Turso database and obtain its URL and auth token.
2. In the Vercel project settings, set `TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN`, `ADMIN_TOKEN`, `GITHUB_TOKEN`, and `GITHUB_USERNAME`.
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