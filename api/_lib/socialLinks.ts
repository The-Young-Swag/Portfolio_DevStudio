import { z } from "zod";

export const socialLinkSchema = z.object({
    label: z.string().min(1),
    href: z.string().default(""),
    icon: z.string().default(""),
    sort_order: z.number().int().default(0),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

export type SocialLink = {
    id: number;
    label: string;
    href: string;
    icon: string;
    sort_order: number;
    created_at: string;
};

function toNumber(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

export function toSocialLink(row: Record<string, unknown>): SocialLink {
    return {
        id: toNumber(row.id, 0),
        label: toString(row.label, ""),
        href: toString(row.href, ""),
        icon: toString(row.icon, ""),
        sort_order: toNumber(row.sort_order, 0),
        created_at: toString(row.created_at, ""),
    };
}
