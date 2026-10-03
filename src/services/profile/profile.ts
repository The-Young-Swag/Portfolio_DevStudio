import { getJson, sendJson } from "../api";

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

export type ProfileInput = Profile;

export async function getProfile(): Promise<Profile> {
    return getJson<Profile>("/api/profile", "Failed to load profile.");
}

export function updateProfile(input: ProfileInput, token: string): Promise<Profile> {
    return sendJson<Profile>("/api/profile", token, "PUT", input, "Failed to save profile.");
}
