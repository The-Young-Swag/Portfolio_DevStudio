import { isAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { projectSchema, toProject } from "../_lib/projects.js";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, title, description, stack, year, category, thumbnail, highlights, repo_url, live_url, sort_order, created_at FROM projects ORDER BY sort_order ASC, id ASC",
        );

        const projects = result.rows.map((row: unknown) =>
            toProject(row as Record<string, unknown>),
        );

        return Response.json(projects, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Projects GET error:", error);
        return Response.json(
            { error: "Unable to load projects." },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    if (!isAdmin(request)) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid project data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const inserted = await db.execute({
            sql: "INSERT INTO projects (title, description, stack, year, category, thumbnail, highlights, repo_url, live_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                input.title,
                input.description,
                JSON.stringify(input.stack),
                input.year,
                input.category,
                input.thumbnail,
                JSON.stringify(input.highlights),
                input.repo_url,
                input.live_url,
                input.sort_order,
            ],
        });

        const id = Number(inserted.lastInsertRowid);
        const created = await db.execute({
            sql: "SELECT id, title, description, stack, year, category, thumbnail, highlights, repo_url, live_url, sort_order, created_at FROM projects WHERE id = ?",
            args: [id],
        });

        const row = created.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Unable to load created project." },
                { status: 500 },
            );
        }

        return Response.json(toProject(row), { status: 201 });
    } catch (error) {
        console.error("Projects POST error:", error);
        return Response.json(
            { error: "Unable to create project." },
            { status: 500 },
        );
    }
}
