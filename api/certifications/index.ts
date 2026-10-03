import { isAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { certificationSchema, findParentError, toCertification } from "../_lib/certifications.js";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, name, issuer, year, credential, badge, code, accent, image, link, parent_id, pdf, badge_image, badge_link, sort_order, created_at FROM certifications ORDER BY sort_order ASC, id ASC",
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

    const parsed = certificationSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid certification data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const parentError = await findParentError(db, input.parent_id, null);

        if (parentError !== null) {
            return Response.json({ error: parentError }, { status: 400 });
        }

        const inserted = await db.execute({
            sql: "INSERT INTO certifications (name, issuer, year, credential, badge, code, accent, image, link, parent_id, pdf, badge_image, badge_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                input.name,
                input.issuer,
                input.year,
                input.credential,
                input.badge,
                input.code,
                input.accent,
                input.image,
                input.link,
                input.parent_id,
                input.pdf,
                input.badge_image,
                input.badge_link,
                input.sort_order,
            ],
        });

        const id = Number(inserted.lastInsertRowid);
        const created = await db.execute({
            sql: "SELECT id, name, issuer, year, credential, badge, code, accent, image, link, parent_id, pdf, badge_image, badge_link, sort_order, created_at FROM certifications WHERE id = ?",
            args: [id],
        });

        const row = created.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Unable to load created certification." },
                { status: 500 },
            );
        }

        return Response.json(toCertification(row), { status: 201 });
    } catch (error) {
        console.error("Certifications POST error:", error);
        return Response.json(
            { error: "Unable to create certification." },
            { status: 500 },
        );
    }
}
