import { z } from "zod";

export const stackGroupSchema = z.object({
    group: z.string().min(1),
    items: z.array(z.string()).default([]),
    sort_order: z.number().int().default(0),
});

export type StackGroupInput = z.infer<typeof stackGroupSchema>;

export type StackGroup = {
    id: number;
    group: string;
    items: string[];
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

export function toStackGroup(row: Record<string, unknown>): StackGroup {
    return {
        id: toNumber(row.id, 0),
        group: toString(row.group_name, ""),
        items: parseStringArray(row.items),
        sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}
