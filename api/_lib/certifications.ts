import { z } from "zod";

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
        sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}
