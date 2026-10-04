import { requireAdmin } from "../../_lib/auth.js";
import { getDb } from "../../_lib/db.js";
import {
    isAllowedImageMime,
    MAX_IMAGE_BYTES,
    sniffImageMime,
} from "../../_lib/images.js";

export async function POST(request: Request) {
    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }

    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return Response.json({ error: "Invalid form data." }, { status: 400 });
    }

    const file = form.get("file");

    if (!(file instanceof File)) {
        return Response.json({ error: "No image file provided." }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
        return Response.json(
            { error: "Image must be non-empty and 400 KB or smaller." },
            { status: 400 },
        );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const sniffed = sniffImageMime(bytes);

    if (sniffed === null || (file.type !== "" && file.type !== sniffed)) {
        return Response.json(
            { error: "Only WebP, JPEG, PNG, and AVIF images are allowed." },
            { status: 400 },
        );
    }

    const mime = file.type === "" ? sniffed : file.type;

    if (!isAllowedImageMime(mime)) {
        return Response.json(
            { error: "Only WebP, JPEG, PNG, and AVIF images are allowed." },
            { status: 400 },
        );
    }

    try {
        const db = getDb();
        const inserted = await db.execute({
            sql: "INSERT INTO images (data, mime, size) VALUES (?, ?, ?)",
            args: [bytes, mime, bytes.length],
        });

        const id = Number(inserted.lastInsertRowid);

        return Response.json({ id, url: `/api/images/${id}` }, { status: 201 });
    } catch (error) {
        console.error("Images POST error:", error);
        return Response.json(
            { error: "Unable to store image." },
            { status: 500 },
        );
    }
}
