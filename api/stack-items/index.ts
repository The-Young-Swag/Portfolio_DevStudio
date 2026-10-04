import { checkServerEnv } from "../_lib/env.js";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { stackItemSchema, toStackItem } from "../_lib/stackItems.js";

const SELECT_COLUMNS =
    "id, name, category, level, since_year, is_core, sort_order, created_at FROM stack_items";

export async function GET() {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

    try {
        const db = getDb();
        const result = await db.execute(
            `SELECT ${SELECT_COLUMNS} ORDER BY sort_order ASC, id ASC`,
        );

        const items = result.rows.map((row: unknown) =>
            toStackItem(row as Record<string, unknown>),
        );

        return Response.json(items, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Stack items GET error:", error);
        return Response.json(
            { error: "Unable to load stack." },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

    const authError = requireAdmin(request);

    if (authError) {
        return authError;
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
        const inserted = await db.execute({
            sql: "INSERT INTO stack_items (name, category, level, since_year, is_core, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
            args: [
                input.name,
                input.category,
                input.level,
                input.since_year,
                input.is_core ? 1 : 0,
                input.sort_order,
            ],
        });

        const id = Number(inserted.lastInsertRowid);
        const created = await db.execute({
            sql: `SELECT ${SELECT_COLUMNS} WHERE id = ?`,
            args: [id],
        });

        const row = created.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Unable to load created stack item." },
                { status: 500 },
            );
        }

        return Response.json(toStackItem(row), { status: 201 });
    } catch (error) {
        console.error("Stack items POST error:", error);
        return Response.json(
            { error: "Unable to create stack item." },
            { status: 500 },
        );
    }
}
