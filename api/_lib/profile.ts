import { z } from "zod";

const portraitStateSchema = z.object({
    image: z.string().default(""),
    alt: z.string().default(""),
});

const heroStatSchema = z.object({
    label: z.string().min(1),
    value: z.string().default(""),
    suffix: z.string().default(""),
    icon: z.string().default(""),
    live: z.enum(["contributions"]).nullable().default(null),
});

const alsoTrueItemSchema = z.object({
    text: z.string().min(1),
    icon: z.string().default(""),
});

export const profileSchema = z.object({
    name: z.string().min(1),
    headline: z.string().default(""),
    location: z.string().default(""),
    availability: z.string().default(""),
    description: z.string().default(""),
    github: z.string().default(""),
    linkedin: z.string().default(""),
    email: z.string().default(""),
    resume: z.string().default(""),
    portrait: z.record(z.string(), portraitStateSchema).default({}),
    hero_stats: z.array(heroStatSchema).nullable().default(null),
    also_true: z.array(alsoTrueItemSchema).nullable().default(null),
    contact_heading: z.string().nullable().default(null),
    contact_title: z.string().nullable().default(null),
    contact_intro: z.string().nullable().default(null),
    contact_email_label: z.string().nullable().default(null),
    footer_note: z.string().nullable().default(null),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export type PortraitState = {
    image: string;
    alt: string;
};

export type HeroStat = {
    label: string;
    value: string;
    suffix: string;
    icon: string;
    live: "contributions" | null;
};

export type AlsoTrueItem = {
    text: string;
    icon: string;
};

export type Profile = {
    name: string;
    headline: string;
    location: string;
    availability: string;
    description: string;
    github: string;
    linkedin: string;
    email: string;
    resume: string | null;
    portrait: Record<string, PortraitState>;
    hero_stats: HeroStat[] | null;
    also_true: AlsoTrueItem[] | null;
    contact_heading: string | null;
    contact_title: string | null;
    contact_intro: string | null;
    contact_email_label: string | null;
    footer_note: string | null;
};

function toString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

function toNullableString(value: unknown): string | null {
    return typeof value === "string" ? value : null;
}

function parseJson(value: unknown): unknown {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value) as unknown;
    } catch {
        return null;
    }
}

function toPortrait(value: unknown): Record<string, PortraitState> {
    const parsed = z.record(z.string(), portraitStateSchema).safeParse(parseJson(value));

    return parsed.success ? parsed.data : {};
}

function toHeroStats(value: unknown): HeroStat[] | null {
    const parsed = z.array(heroStatSchema).nullable().safeParse(parseJson(value));

    return parsed.success ? parsed.data : null;
}

function toAlsoTrue(value: unknown): AlsoTrueItem[] | null {
    const parsed = z.array(alsoTrueItemSchema).nullable().safeParse(parseJson(value));

    return parsed.success ? parsed.data : null;
}

export function toProfile(row: Record<string, unknown>): Profile {
    return {
        name: toString(row.name, ""),
        headline: toString(row.headline, ""),
        location: toString(row.location, ""),
        availability: toString(row.availability, ""),
        description: toString(row.description, ""),
        github: toString(row.github, ""),
        linkedin: toString(row.linkedin, ""),
        email: toString(row.email, ""),
        resume: toNullableString(row.resume),
        portrait: toPortrait(row.portrait),
        hero_stats: toHeroStats(row.hero_stats),
        also_true: toAlsoTrue(row.also_true),
        contact_heading: toNullableString(row.contact_heading),
        contact_title: toNullableString(row.contact_title),
        contact_intro: toNullableString(row.contact_intro),
        contact_email_label: toNullableString(row.contact_email_label),
        footer_note: toNullableString(row.footer_note),
    };
}

export function collectPortraitImages(portrait: Record<string, PortraitState>): string[] {
    return Object.values(portrait)
        .map((state) => state.image)
        .filter((image) => image !== "");
}
