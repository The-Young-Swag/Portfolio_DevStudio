import { z } from "zod";

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
});

export type ProfileInput = z.infer<typeof profileSchema>;

export type Profile = {
    name: string;
    headline: string;
    location: string;
    availability: string;
    description: string;
    github: string;
    linkedin: string;
    email: string;
    resume: string;
};

function toString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
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
        resume: toString(row.resume, ""),
    };
}
