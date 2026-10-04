import { checkServerEnv } from "../_lib/env.js";
import { getDb } from "../_lib/db.js";
import { toBytes } from "../_lib/images.js";

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
        return Response.json({ error: "Invalid image id." }, { status: 400 });
    }

    try {
        const db = getDb();
        const result = await db.execute({
            sql: "SELECT data, mime FROM images WHERE id = ?",
            args: [id],
        });

        const row = result.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row || typeof row.mime !== "string") {
            return Response.json({ error: "Image not found." }, { status: 404 });
        }

        const bytes = toBytes(row.data);

        if (!bytes) {
            return Response.json({ error: "Image not found." }, { status: 404 });
        }

        return new Response(bytes, {
            headers: {
                "Content-Type": row.mime,
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Images GET error:", error);
        return Response.json(
            { error: "Unable to load image." },
            { status: 500 },
        );
    }
}
