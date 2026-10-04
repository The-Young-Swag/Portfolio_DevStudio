import type { Client } from "@libsql/client";

export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_FILENAME_LENGTH = 80;

export function isPdfBytes(bytes: Uint8Array): boolean {
    return (
        bytes.length >= 5 &&
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46 &&
        bytes[4] === 0x2d
    );
}

function stripUnsafeChars(value: string): string {
    let out = "";

    for (const char of value) {
        const code = char.codePointAt(0) ?? 0;

        if (code < 32 || code === 127) {
            continue;
        }

        if (
            char === '"' ||
            char === "<" ||
            char === ">" ||
            char === "|" ||
            char === ":" ||
            char === "?" ||
            char === "*" ||
            char === "\\"
        ) {
            continue;
        }

        out += char;
    }

    return out;
}

export function sanitizeFilename(name: unknown, fallback: string): string {
    const raw = typeof name === "string" ? name : "";

    const lastSegment = raw.split(/[\\/]/).pop() ?? "";
    const base = stripUnsafeChars(lastSegment).trim();

    const stem = (base === undefined || base === "" ? fallback : base).replace(
        /\.pdf$/i,
        "",
    );

    const trimmedStem = stem.slice(0, MAX_FILENAME_LENGTH - 4);

    return `${trimmedStem === "" ? "file" : trimmedStem}.pdf`;
}

export function getStoredFileId(url: unknown): number | null {
    if (typeof url !== "string") {
        return null;
    }

    const match = /^\/api\/files\/(\d+)$/.exec(url.trim());

    if (!match) {
        return null;
    }

    const id = Number(match[1]);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

export async function deleteStoredFile(db: Client, url: unknown): Promise<void> {
    const id = getStoredFileId(url);

    if (id === null) {
        return;
    }

    await db.execute({
        sql: "DELETE FROM files WHERE id = ?",
        args: [id],
    });
}
