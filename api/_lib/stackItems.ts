import { z } from "zod";

export const stackItemSchema = z.object({
    name: z.string().min(1),
    category: z.enum(["language", "framework", "library", "database", "tool"]),
    level: z.enum(["learning", "comfortable", "confident"]).default("comfortable"),
    since_year: z.number().int().min(1990).max(2100).nullable().default(null),
    is_core: z.boolean().default(false),
    sort_order: z.number().int().default(0),
});

export type StackItemInput = z.infer<typeof stackItemSchema>;

export type StackItem = {
    id: number;
    name: string;
    category: "language" | "framework" | "library" | "database" | "tool";
    level: "learning" | "comfortable" | "confident";
    since_year: number | null;
    is_core: boolean;
    sort_order: number;
    created_at: string;
};

function toNumber(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

function toNullableNumber(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isInteger(value)) {
        return null;
    }

    return value;
}

function toCategory(value: unknown): StackItem["category"] {
    if (
        value === "language" ||
        value === "framework" ||
        value === "library" ||
        value === "database" ||
        value === "tool"
    ) {
        return value;
    }

    return "tool";
}

function toLevel(value: unknown): StackItem["level"] {
    if (value === "learning" || value === "confident" || value === "comfortable") {
        return value;
    }

    return "comfortable";
}

export function toStackItem(row: Record<string, unknown>): StackItem {
    return {
        id: toNumber(row.id, 0),
        name: toString(row.name, ""),
        category: toCategory(row.category),
        level: toLevel(row.level),
        since_year: toNullableNumber(row.since_year),
        is_core: toNumber(row.is_core, 0) !== 0,
        sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}
