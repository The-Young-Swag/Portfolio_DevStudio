import { getDb } from "../_lib/db.js";
import { toStackGroup } from "../_lib/stack.js";

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
