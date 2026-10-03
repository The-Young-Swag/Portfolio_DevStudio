import { isAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { stackGroupSchema, toStackGroup } from "../_lib/stack.js";

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
        return Response.json({ error: "Invalid stack id." }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = stackGroupSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: "Invalid stack data." }, { status: 400 });
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const updated = await db.execute({
            sql: "UPDATE stack SET group_name = ?, items = ?, sort_order = ? WHERE id = ?",
            args: [input.group, JSON.stringify(input.items), input.sort_order, id],
        });

        if (updated.rowsAffected === 0) {
            return Response.json(
                { error: "Stack group not found." },
                { status: 404 },
            );
        }

        const selected = await db.execute({
            sql: "SELECT id, group_name, items, sort_order, created_at FROM stack WHERE id = ?",
            args: [id],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Stack group not found." },
                { status: 404 },
            );
        }

        return Response.json(toStackGroup(row));
    } catch (error) {
        console.error("Stack PUT error:", error);
        return Response.json(
            { error: "Unable to update stack group." },
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
        return Response.json({ error: "Invalid stack id." }, { status: 400 });
    }

    try {
        const db = getDb();
        const deleted = await db.execute({
            sql: "DELETE FROM stack WHERE id = ?",
            args: [id],
        });

        if (deleted.rowsAffected === 0) {
            return Response.json(
                { error: "Stack group not found." },
                { status: 404 },
            );
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Stack DELETE error:", error);
        return Response.json(
            { error: "Unable to delete stack group." },
            { status: 500 },
        );
    }
}
