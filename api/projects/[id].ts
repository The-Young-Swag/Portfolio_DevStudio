import { isAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { deleteStoredImage } from "../_lib/images.js";
import { projectSchema, toProject } from "../_lib/projects.js";

function getId(request: Request): number | null {
    try {
        const parts = new URL(request.url).pathname
            .split("/")
            .filter(Boolean);
        const id = Number(parts[parts.length - 1]);

        if (!Number.isInteger(id) || id <= 0) {
            return null;
        }

        return id;
    } catch {
        return null;
    }
}

export async function PUT(request: Request) {
    if (!isAdmin(request)) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const id = getId(request);
    if (id === null) {
        return Response.json({ error: "Invalid project id." }, { status: 400 });
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
        const previous = await db.execute({
            sql: "SELECT thumbnail FROM projects WHERE id = ?",
            args: [id],
        });

        const previousRow = previous.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!previousRow) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        const updated = await db.execute({
            sql: "UPDATE projects SET title = ?, description = ?, stack = ?, year = ?, category = ?, thumbnail = ?, highlights = ?, repo_url = ?, live_url = ?, sort_order = ? WHERE id = ?",
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
                id,
            ],
        });

        if (updated.rowsAffected === 0) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        if (previousRow.thumbnail !== input.thumbnail) {
            await deleteStoredImage(db, previousRow.thumbnail);
        }

        const selected = await db.execute({
            sql: "SELECT id, title, description, stack, year, category, thumbnail, highlights, repo_url, live_url, sort_order, created_at FROM projects WHERE id = ?",
            args: [id],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        return Response.json(toProject(row));
    } catch (error) {
        console.error("Projects PUT error:", error);
        return Response.json(
            { error: "Unable to update project." },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    if (!isAdmin(request)) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const id = getId(request);
    if (id === null) {
        return Response.json({ error: "Invalid project id." }, { status: 400 });
    }

    try {
        const db = getDb();
        const previous = await db.execute({
            sql: "SELECT thumbnail FROM projects WHERE id = ?",
            args: [id],
        });

        const previousRow = previous.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!previousRow) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        const deleted = await db.execute({
            sql: "DELETE FROM projects WHERE id = ?",
            args: [id],
        });

        if (deleted.rowsAffected === 0) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        await deleteStoredImage(db, previousRow.thumbnail);

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Projects DELETE error:", error);
        return Response.json(
            { error: "Unable to delete project." },
            { status: 500 },
        );
    }
}
