import { checkServerEnv } from "../../_lib/env.js";
import { getDb } from "../../_lib/db.js";
import { toBytes, toResponseBytes } from "../../_lib/images.js";

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

export async function GET(request: Request) {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }
    const id = getId(request);

    if (id === null) {
        return Response.json({ error: "Invalid file id." }, { status: 400 });
    }

    try {
        const db = getDb();
        const result = await db.execute({
            sql: "SELECT filename, content_type, data FROM files WHERE id = ?",
            args: [id],
        });

        const row = result.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row || typeof row.filename !== "string" || typeof row.content_type !== "string") {
            return Response.json({ error: "File not found." }, { status: 404 });
        }

        const bytes = toBytes(row.data);

        if (!bytes) {
            return Response.json({ error: "File not found." }, { status: 404 });
        }

        return new Response(toResponseBytes(bytes), {
            headers: {
                "Content-Type": row.content_type,
                "Content-Disposition": `inline; filename="${row.filename}"`,
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Files GET error:", error);
        return Response.json(
            { error: "Unable to load file." },
            { status: 500 },
        );
    }
}
