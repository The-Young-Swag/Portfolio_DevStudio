import { checkServerEnv } from "../../_lib/env.js";
import { requireAdmin } from "../../_lib/auth.js";
import { getDb } from "../../_lib/db.js";
import { isPdfBytes, MAX_FILE_BYTES, sanitizeFilename } from "../../_lib/files.js";

export async function POST(request: Request) {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

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
        return Response.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
        return Response.json(
            { error: "File must be non-empty and 2 MB or smaller." },
            { status: 400 },
        );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    if (!isPdfBytes(bytes)) {
        return Response.json(
            { error: "Only PDF files are allowed." },
            { status: 400 },
        );
    }

    const fallbackName = sanitizeFilename(form.get("fallbackName"), "file.pdf");
    const filename = sanitizeFilename(file.name, fallbackName);

    try {
        const db = getDb();
        const inserted = await db.execute({
            sql: "INSERT INTO files (filename, content_type, data, size) VALUES (?, ?, ?, ?)",
            args: [filename, "application/pdf", bytes, bytes.length],
        });

        const id = Number(inserted.lastInsertRowid);

        return Response.json(
            { id, url: `/api/files/${id}`, filename, size: bytes.length },
            { status: 201 },
        );
    } catch (error) {
        console.error("Files POST error:", error);
        return Response.json(
            { error: "Unable to store file." },
            { status: 500 },
        );
    }
}
