import { getJson, sendJson } from "../api";

export type PortraitState = {
    image: string;
    alt: string;
};

export type HeroStat = {
    label: string;
    value: string;
    suffix: string;
    icon: string;
    live: "experience" | "contributions" | null;
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

export type ProfileInput = Profile;

export async function getProfile(): Promise<Profile> {
    return getJson<Profile>("/api/profile", "Failed to load profile.");
}

export function updateProfile(input: ProfileInput, token: string): Promise<Profile> {
    return sendJson<Profile>("/api/profile", token, "PUT", input, "Failed to save profile.");
}
