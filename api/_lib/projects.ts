import { z } from "zod";

export const projectSchema = z.object({
    title: z.string().min(1),
    description: z.string().default(""),
    stack: z.array(z.string()).default([]),
    year: z.number().int().min(1900).max(2100),
    category: z.string().default(""),
    thumbnail: z.string().default(""),
    highlights: z.array(z.string()).default([]),
    repo_url: z.string().default(""),
    live_url: z.string().default(""),
    sort_order: z.number().int().default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export type Project = {
    id: number;
    title: string;
    description: string;
    stack: string[];
    year: number;
    category: string;
    thumbnail: string;
    highlights: string[];
    repo_url: string;
    live_url: string;
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

export function toProject(row: Record<string, unknown>): Project {
    return {
        id: toNumber(row.id, 0),
        title: toString(row.title, ""),
        description: toString(row.description, ""),
        stack: parseStringArray(row.stack),
        year: toNumber(row.year, 0),
        category: toString(row.category, ""),
    thumbnail: toString(row.thumbnail, ""),
    highlights: parseStringArray(row.highlights),
    repo_url: toString(row.repo_url, ""),
    live_url: toString(row.live_url, ""),
    sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}
