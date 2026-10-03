import { getDb } from "../_lib/db.js";
import { toExperienceEntry } from "../_lib/experience.js";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, period, role, company, description, sort_order, created_at FROM experience ORDER BY sort_order ASC, id ASC",
        );

        const entries = result.rows.map((row: unknown) =>
            toExperienceEntry(row as Record<string, unknown>),
        );

        return Response.json(entries, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Experience GET error:", error);
        return Response.json(
            { error: "Unable to load experience." },
            { status: 500 },
        );
    }
}
