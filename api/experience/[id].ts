import { isAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { experienceSchema, toExperienceEntry } from "../_lib/experience.js";

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
        return Response.json(
            { error: "Invalid experience id." },
            { status: 400 },
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = experienceSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid experience data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const updated = await db.execute({
            sql: "UPDATE experience SET period = ?, role = ?, company = ?, description = ?, sort_order = ? WHERE id = ?",
            args: [
                input.period,
                input.role,
                input.company,
                JSON.stringify(input.description),
                input.sort_order,
                id,
            ],
        });

        if (updated.rowsAffected === 0) {
            return Response.json(
                { error: "Experience entry not found." },
                { status: 404 },
            );
        }

        const selected = await db.execute({
            sql: "SELECT id, period, role, company, description, sort_order, created_at FROM experience WHERE id = ?",
            args: [id],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Experience entry not found." },
                { status: 404 },
            );
        }

        return Response.json(toExperienceEntry(row));
    } catch (error) {
        console.error("Experience PUT error:", error);
        return Response.json(
            { error: "Unable to update experience entry." },
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
        return Response.json(
            { error: "Invalid experience id." },
            { status: 400 },
        );
    }

    try {
        const db = getDb();
        const deleted = await db.execute({
            sql: "DELETE FROM experience WHERE id = ?",
            args: [id],
        });

        if (deleted.rowsAffected === 0) {
            return Response.json(
                { error: "Experience entry not found." },
                { status: 404 },
            );
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Experience DELETE error:", error);
        return Response.json(
            { error: "Unable to delete experience entry." },
            { status: 500 },
        );
    }
}
