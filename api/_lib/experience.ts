import { z } from "zod";

export const experienceSchema = z.object({
    period: z.string().default(""),
    role: z.string().min(1),
    company: z.string().default(""),
    description: z.array(z.string()).default([]),
    sort_order: z.number().int().default(0),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;

export type ExperienceEntry = {
    id: number;
    period: string;
    role: string;
    company: string;
    description: string[];
    sort_order: number;
    created_at: string;
};

function parseStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
    }

    if (typeof value === "string") {
        try {
            const parsed: unknown = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.filter((item): item is string => typeof item === "string");
            }
        } catch {
            return [];
        }
    }

    return [];
}

function toNumber(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

export function toExperienceEntry(row: Record<string, unknown>): ExperienceEntry {
    return {
        id: toNumber(row.id, 0),
        period: toString(row.period, ""),
        role: toString(row.role, ""),
        company: toString(row.company, ""),
        description: parseStringArray(row.description),
        sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}
