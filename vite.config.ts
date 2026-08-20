import { defineConfig, loadEnv, type PluginOption } from "vite";
import type { Connect } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/*
 * Dev-only bridge for the GitHub contributions API.
 *
 * The real endpoint is a Vercel serverless function under api/. Vite does not
 * serve that directory, so without this middleware local development would
 * fetch the raw TypeScript source instead. This plugin runs the exact same
 * GET handler server-side in the dev server, loading credentials from the
 * environment (e.g. .env.local). It is dev-only and never ships to production.
 */
function githubApiMiddleware(): PluginOption {
    return {
        name: "portfolio:github-api",
        apply: "serve",
        configureServer(server) {
            const handler: Connect.NextHandleFunction = async (
                _request,
                response,
            ) => {
                const env = loadEnv(server.config.mode, process.cwd(), "");
                process.env.GITHUB_TOKEN =
                    process.env.GITHUB_TOKEN ?? env.GITHUB_TOKEN;
                process.env.GITHUB_USERNAME =
                    process.env.GITHUB_USERNAME ?? env.GITHUB_USERNAME;

                const { GET } = await import("./api/github/contributions.ts");
                const result = await GET();

                response.statusCode = result.status;
                response.setHeader("Content-Type", "application/json");
                response.setHeader(
                    "Cache-Control",
                    result.headers.get("cache-control") ?? "no-cache",
                );
                response.end(await result.text());
            };

            server.middlewares.use(
                "/api/github/contributions",
                handler,
            );
        },
    };
}

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        githubApiMiddleware(),
    ],

    server: {
        port: 4975,
        strictPort: true,
        watch: {
            usePolling: true,
            interval: 300,
        },
    },

    resolve: {
        tsconfigPaths: true,
    },
});