import { checkServerEnv } from "../_lib/env.js";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { socialLinkSchema, toSocialLink } from "../_lib/socialLinks.js";

export async function GET() {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

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

    const parsed = socialLinkSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid social link data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const inserted = await db.execute({
            sql: "INSERT INTO social_links (label, href, icon, sort_order) VALUES (?, ?, ?, ?)",
            args: [input.label, input.href, input.icon, input.sort_order],
        });

        const id = Number(inserted.lastInsertRowid);
        const created = await db.execute({
            sql: "SELECT id, label, href, icon, sort_order, created_at FROM social_links WHERE id = ?",
            args: [id],
        });

        const row = created.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Unable to load created social link." },
                { status: 500 },
            );
        }

        return Response.json(toSocialLink(row), { status: 201 });
    } catch (error) {
        console.error("Social links POST error:", error);
        return Response.json(
            { error: "Unable to create social link." },
            { status: 500 },
        );
    }
}
