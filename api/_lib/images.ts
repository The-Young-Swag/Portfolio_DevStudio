import type { Client } from "@libsql/client";

export const MAX_IMAGE_BYTES = 400 * 1024;

const ALLOWED_IMAGE_MIMES = ["image/webp", "image/jpeg", "image/png", "image/avif"];

export function isAllowedImageMime(mime: string): boolean {
    return ALLOWED_IMAGE_MIMES.includes(mime);
}

export function sniffImageMime(bytes: Uint8Array): string | null {
    if (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
    ) {
        return "image/png";
    }

    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "image/jpeg";
    }

    if (
        bytes.length >= 12 &&
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
    ) {
        return "image/webp";
    }

    if (
        bytes.length >= 12 &&
        bytes[4] === 0x66 &&
        bytes[5] === 0x74 &&
        bytes[6] === 0x79 &&
        bytes[7] === 0x70 &&
        ((bytes[8] === 0x61 &&
            bytes[9] === 0x76 &&
            bytes[10] === 0x69 &&
            bytes[11] === 0x66) ||
            (bytes[8] === 0x61 &&
                bytes[9] === 0x76 &&
                bytes[10] === 0x69 &&
                bytes[11] === 0x73))
    ) {
        return "image/avif";
    }

    return null;
}
export function getStoredImageId(url: unknown): number | null {
    if (typeof url !== "string") {
        return null;
    }
    const match = /^\/api\/images\/(\d+)$/.exec(url.trim());

    if (!match) {
        return null;
    }

    const id = Number(match[1]);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

export async function deleteStoredImage(db: Client, url: unknown): Promise<void> {
    const id = getStoredImageId(url);

    if (id === null) {
        return;
    }

    await db.execute({
        sql: "DELETE FROM images WHERE id = ?",
        args: [id],
    });
}

export function toBytes(value: unknown): Uint8Array | null {
    if (value instanceof Uint8Array) {
        return value;
    }

    if (value instanceof ArrayBuffer) {
        return new Uint8Array(value);
    }

    return null;
}
