import { isAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { stackGroupSchema, toStackGroup } from "../_lib/stack.js";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, group_name, items, sort_order, created_at FROM stack ORDER BY sort_order ASC, id ASC",
        );

        const groups = result.rows.map((row: unknown) =>
            toStackGroup(row as Record<string, unknown>),
        );

        return Response.json(groups, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Stack GET error:", error);
        return Response.json(
            { error: "Unable to load stack." },
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

    const parsed = stackGroupSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid stack data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const inserted = await db.execute({
            sql: "INSERT INTO stack (group_name, items, sort_order) VALUES (?, ?, ?)",
            args: [input.group, JSON.stringify(input.items), input.sort_order],
        });

        const id = Number(inserted.lastInsertRowid);
        const created = await db.execute({
            sql: "SELECT id, group_name, items, sort_order, created_at FROM stack WHERE id = ?",
            args: [id],
        });

        const row = created.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Unable to load created stack group." },
                { status: 500 },
            );
        }

        return Response.json(toStackGroup(row), { status: 201 });
    } catch (error) {
        console.error("Stack POST error:", error);
        return Response.json(
            { error: "Unable to create stack group." },
            { status: 500 },
        );
    }
}
