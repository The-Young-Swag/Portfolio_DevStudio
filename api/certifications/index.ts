import { getDb } from "../_lib/db.js";
import { toCertification } from "../_lib/certifications.js";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, name, issuer, year, credential, badge, code, accent, sort_order, created_at FROM certifications ORDER BY sort_order ASC, id ASC",
        );

        const certifications = result.rows.map((row: unknown) =>
            toCertification(row as Record<string, unknown>),
        );

        return Response.json(certifications, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Certifications GET error:", error);
        return Response.json(
            { error: "Unable to load certifications." },
            { status: 500 },
        );
    }
}
