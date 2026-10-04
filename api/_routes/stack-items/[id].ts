import { requireAdmin } from "../../_lib/auth.js";
import { getDb } from "../../_lib/db.js";
import { stackItemSchema, toStackItem } from "../../_lib/stackItems.js";

const SELECT_COLUMNS =
    "id, name, category, level, since_year, is_core, sort_order, created_at FROM stack_items";

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
    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }

    const id = getId(request);
    if (id === null) {
        return Response.json({ error: "Invalid stack item id." }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = stackItemSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid stack item data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const updated = await db.execute({
            sql: "UPDATE stack_items SET name = ?, category = ?, level = ?, since_year = ?, is_core = ?, sort_order = ? WHERE id = ?",
            args: [
                input.name,
                input.category,
                input.level,
                input.since_year,
                input.is_core ? 1 : 0,
                input.sort_order,
                id,
            ],
        });

        if (updated.rowsAffected === 0) {
            return Response.json(
                { error: "Stack item not found." },
                { status: 404 },
            );
        }

        const selected = await db.execute({
            sql: `SELECT ${SELECT_COLUMNS} WHERE id = ?`,
            args: [id],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Stack item not found." },
                { status: 404 },
            );
        }

        return Response.json(toStackItem(row));
    } catch (error) {
        console.error("Stack items PUT error:", error);
        return Response.json(
            { error: "Unable to update stack item." },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }

    const id = getId(request);
    if (id === null) {
        return Response.json({ error: "Invalid stack item id." }, { status: 400 });
    }

    try {
        const db = getDb();
        const deleted = await db.execute({
            sql: "DELETE FROM stack_items WHERE id = ?",
            args: [id],
        });

        if (deleted.rowsAffected === 0) {
            return Response.json(
                { error: "Stack item not found." },
                { status: 404 },
            );
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Stack items DELETE error:", error);
        return Response.json(
            { error: "Unable to delete stack item." },
            { status: 500 },
        );
    }
}
