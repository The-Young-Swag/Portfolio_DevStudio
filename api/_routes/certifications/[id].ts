import { requireAdmin } from "../../_lib/auth.js";
import { getDb } from "../../_lib/db.js";
import { deleteStoredImage } from "../../_lib/images.js";
import { certificationSchema, findParentError, toCertification } from "../../_lib/certifications.js";
import { deleteStoredFile } from "../../_lib/files.js";

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
        return Response.json(
            { error: "Invalid certification id." },
            { status: 400 },
        );
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
        const previous = await db.execute({
            sql: "SELECT image, pdf, badge_image FROM certifications WHERE id = ?",
            args: [id],
        });

        const previousRow = previous.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!previousRow) {
            return Response.json(
                { error: "Certification not found." },
                { status: 404 },
            );
        }

        const parentError = await findParentError(db, input.parent_id, id);

        if (parentError !== null) {
            return Response.json({ error: parentError }, { status: 400 });
        }

        const updated = await db.execute({
            sql: "UPDATE certifications SET name = ?, issuer = ?, year = ?, credential = ?, badge = ?, code = ?, accent = ?, image = ?, link = ?, parent_id = ?, pdf = ?, badge_image = ?, badge_link = ?, sort_order = ? WHERE id = ?",
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
                id,
            ],
        });

        if (updated.rowsAffected === 0) {
            return Response.json(
                { error: "Certification not found." },
                { status: 404 },
            );
        }

        if (previousRow.image !== input.image) {
            await deleteStoredImage(db, previousRow.image).catch((error) => {
                console.error("Certifications PUT image cleanup error:", error);
            });
        }

        if (previousRow.pdf !== input.pdf) {
            await deleteStoredFile(db, previousRow.pdf).catch((error) => {
                console.error("Certifications PUT file cleanup error:", error);
            });
        }

        if (previousRow.badge_image !== input.badge_image) {
            await deleteStoredImage(db, previousRow.badge_image).catch((error) => {
                console.error("Certifications PUT badge cleanup error:", error);
            });
        }

        const selected = await db.execute({
            sql: "SELECT id, name, issuer, year, credential, badge, code, accent, image, link, parent_id, pdf, badge_image, badge_link, sort_order, created_at FROM certifications WHERE id = ?",
            args: [id],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Certification not found." },
                { status: 404 },
            );
        }

        return Response.json(toCertification(row));
    } catch (error) {
        console.error("Certifications PUT error:", error);
        return Response.json(
            { error: "Unable to update certification." },
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
        return Response.json(
            { error: "Invalid certification id." },
            { status: 400 },
        );
    }

    try {
        const db = getDb();
        const previous = await db.execute({
            sql: "SELECT image, pdf, badge_image FROM certifications WHERE id = ?",
            args: [id],
        });

        const previousRow = previous.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!previousRow) {
            return Response.json(
                { error: "Certification not found." },
                { status: 404 },
            );
        }

        const children = await db.execute({
            sql: "SELECT id, image, pdf, badge_image FROM certifications WHERE parent_id = ?",
            args: [id],
        });

        const blobOwners = [
            ...children.rows.map((child) => child as unknown as Record<string, unknown>),
            previousRow,
        ];

        // Delete the rows atomically first: either the whole subtree is
        // gone or nothing is, so a failure can never lose data while
        // leaving orphans behind.
        const deleted = await db.batch([
            { sql: "DELETE FROM certifications WHERE parent_id = ?", args: [id] },
            { sql: "DELETE FROM certifications WHERE id = ?", args: [id] },
        ]);

        if (deleted[1].rowsAffected === 0) {
            return Response.json(
                { error: "Certification not found." },
                { status: 404 },
            );
        }

        // Blob cleanup is best-effort: a failure leaks a blob row but must
        // never fail a delete that already succeeded.
        for (const owner of blobOwners) {
            try {
                await deleteStoredImage(db, owner.image);
                await deleteStoredFile(db, owner.pdf);
                await deleteStoredImage(db, owner.badge_image);
            } catch (error) {
                console.error("Certifications DELETE cleanup error:", error);
            }
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Certifications DELETE error:", error);
        return Response.json(
            { error: "Unable to delete certification." },
            { status: 500 },
        );
    }
}
