import { z } from "zod";
import type { Client } from "@libsql/client";

export const certificationSchema = z.object({
    name: z.string().min(1),
    issuer: z.string().default(""),
    year: z.string().default(""),
    credential: z.string().default(""),
    badge: z.string().default(""),
    code: z.string().default(""),
    accent: z.enum(["blue", "purple", "viridian"]).default("blue"),
    image: z.string().default(""),
    link: z.string().default(""),
    parent_id: z.number().int().positive().nullable().default(null),
    pdf: z.string().default(""),
    badge_image: z.string().default(""),
    badge_link: z.string().default(""),
    sort_order: z.number().int().default(0),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

export type Certification = {
    id: number;
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    accent: "blue" | "purple" | "viridian";
    image: string;
    link: string;
    parent_id: number | null;
    pdf: string;
    badge_image: string;
    badge_link: string;
    sort_order: number;
    created_at: string;
};

function toString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toAccent(value: unknown): Certification["accent"] {
    if (value === "purple" || value === "viridian" || value === "blue") {
        return value;
    }

    return "blue";
}

function toParentId(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        return null;
    }

    return value;
}

export function toCertification(row: Record<string, unknown>): Certification {
    return {
        id: toNumber(row.id, 0),
        name: toString(row.name, ""),
        issuer: toString(row.issuer, ""),
        year: toString(row.year, ""),
        credential: toString(row.credential, ""),
        badge: toString(row.badge, ""),
        code: toString(row.code, ""),
        accent: toAccent(row.accent),
        image: toString(row.image, ""),
        link: toString(row.link, ""),
        parent_id: toParentId(row.parent_id),
        pdf: toString(row.pdf, ""),
        badge_image: toString(row.badge_image, ""),
        badge_link: toString(row.badge_link, ""),
        sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}

export async function findParentError(
    db: Client,
    parentId: number | null,
    selfId: number | null,
): Promise<string | null> {
    if (parentId === null) {
        return null;
    }

    if (selfId !== null && parentId === selfId) {
        return "A certificate cannot be its own parent.";
    }

    const found = await db.execute({
        sql: "SELECT id, parent_id FROM certifications WHERE id = ?",
        args: [parentId],
    });

    const row = found.rows[0] as unknown as Record<string, unknown> | undefined;

    if (!row) {
        return "Parent certification not found.";
    }

    if (row.parent_id !== null && row.parent_id !== undefined) {
        return "A child certificate cannot have children of its own.";
    }

    return null;
}
