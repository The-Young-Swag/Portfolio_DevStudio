import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { socialLinkSchema, toSocialLink } from "../_lib/socialLinks.js";

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
        return Response.json({ error: "Invalid social link id." }, { status: 400 });
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
        const updated = await db.execute({
            sql: "UPDATE social_links SET label = ?, href = ?, icon = ?, sort_order = ? WHERE id = ?",
            args: [input.label, input.href, input.icon, input.sort_order, id],
        });

        if (updated.rowsAffected === 0) {
            return Response.json(
                { error: "Social link not found." },
                { status: 404 },
            );
        }

        const selected = await db.execute({
            sql: "SELECT id, label, href, icon, sort_order, created_at FROM social_links WHERE id = ?",
            args: [id],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Social link not found." },
                { status: 404 },
            );
        }

        return Response.json(toSocialLink(row));
    } catch (error) {
        console.error("Social links PUT error:", error);
        return Response.json(
            { error: "Unable to update social link." },
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
        return Response.json({ error: "Invalid social link id." }, { status: 400 });
    }

    try {
        const db = getDb();
        const deleted = await db.execute({
            sql: "DELETE FROM social_links WHERE id = ?",
            args: [id],
        });

        if (deleted.rowsAffected === 0) {
            return Response.json(
                { error: "Social link not found." },
                { status: 404 },
            );
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Social links DELETE error:", error);
        return Response.json(
            { error: "Unable to delete social link." },
            { status: 500 },
        );
    }
}
