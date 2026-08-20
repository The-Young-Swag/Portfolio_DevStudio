# Ivan Harvey Rivera — Portfolio

A fast, glassmorphic single-page portfolio built with **Vite, React and
TypeScript**. Five sections (Home, Projects, Experience, Stack,
Certifications) plus a live GitHub contribution log.

## Getting started

Requires **Node.js 20+**.

```bash
npm install
npm run dev
```

Open **http://localhost:4975** in your browser. The dev server is configured
for the repository's VS Code dev container (port `4975` is forwarded to the
host automatically).

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

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the Vite dev server on port 4975         |
| `npm run build`     | Type-check and build for production            |
| `npm run preview`   | Preview the production build locally           |
| `npm run lint`      | Run ESLint                                     |

## Structure

```
api/                  Vercel serverless functions (GitHub contributions)
src/app/              Routing and app providers (React Query, theme)
src/components/       Layout, navigation, hero, github, projects, …
src/constants/        Content: profile, navigation, projects, stack, …
src/context/          Shared state (theme)
src/hooks/            TanStack Query hooks for the GitHub API
src/pages/            Route-level pages (lazy-loaded)
src/styles/           Fonts and global styles
```

## Design

Minimal, editorial, technical. Brand colors amber `#ecad0a`, blue `#209dd7`
and purple `#753991` with grays; glass panels over a fixed atmospheric
background; light and dark themes via a shared `ThemeProvider` (persisted in
`localStorage`).