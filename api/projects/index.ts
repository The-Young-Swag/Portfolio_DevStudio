import { getDb } from "../_lib/db.js";
import { toProject } from "../_lib/projects.js";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, title, description, stack, year, category, thumbnail, highlights, sort_order, created_at FROM projects ORDER BY sort_order ASC, id ASC",
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
