import { z } from "zod";

const caseScreenshotSchema = z.object({
    url: z.string().min(1),
    caption: z.string().default(""),
});

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
    source_access: z.enum(["public", "private"]).nullable().default(null),
    demo_access: z.enum(["public", "internal", "offline", "none"]).nullable().default(null),
    access_note: z.string().default(""),
    has_case_study: z.boolean().default(false),
    case_problem: z.string().default(""),
    case_role: z.string().default(""),
    case_solution: z.string().default(""),
    case_result: z.string().default(""),
    case_screenshots: z.array(caseScreenshotSchema).default([]),
    sort_order: z.number().int().default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export type CaseScreenshot = {
    url: string;
    caption: string;
};

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
    source_access: "public" | "private" | null;
    demo_access: "public" | "internal" | "offline" | "none" | null;
    access_note: string;
    has_case_study: boolean;
    case_problem: string;
    case_role: string;
    case_solution: string;
    case_result: string;
    case_screenshots: CaseScreenshot[];
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

function toSourceAccess(value: unknown): Project["source_access"] {
    if (value === "public" || value === "private") {
        return value;
    }

    return null;
}

function toDemoAccess(value: unknown): Project["demo_access"] {
    if (value === "public" || value === "internal" || value === "offline" || value === "none") {
        return value;
    }

    return null;
}

function toCaseScreenshots(value: unknown): CaseScreenshot[] {
    const parsed = z.array(caseScreenshotSchema).safeParse(parseJsonArray(value));

    return parsed.success ? parsed.data : [];
}

function parseJsonArray(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        try {
            return JSON.parse(value) as unknown;
        } catch {
            return [];
        }
    }

    return [];
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
        source_access: toSourceAccess(row.source_access),
        demo_access: toDemoAccess(row.demo_access),
        access_note: toString(row.access_note, ""),
        has_case_study: toNumber(row.has_case_study, 0) !== 0,
        case_problem: toString(row.case_problem, ""),
        case_role: toString(row.case_role, ""),
        case_solution: toString(row.case_solution, ""),
        case_result: toString(row.case_result, ""),
        case_screenshots: toCaseScreenshots(row.case_screenshots),
        sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}

export function screenshotUrls(value: unknown): string[] {
    return toCaseScreenshots(value).map((shot) => shot.url);
}

export function removedScreenshotUrls(
    previous: unknown,
    next: CaseScreenshot[],
): string[] {
    const kept = new Set(next.map((shot) => shot.url));

    return screenshotUrls(previous).filter((url) => !kept.has(url));
}
