import { getDb } from "../_lib/db.js";
import { toSocialLink } from "../_lib/socialLinks.js";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, label, href, icon, sort_order, created_at FROM social_links ORDER BY sort_order ASC, id ASC",
        );

        const links = result.rows.map((row: unknown) =>
            toSocialLink(row as Record<string, unknown>),
        );

        return Response.json(links, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Social links GET error:", error);
        return Response.json(
            { error: "Unable to load social links." },
            { status: 500 },
        );
    }
}
