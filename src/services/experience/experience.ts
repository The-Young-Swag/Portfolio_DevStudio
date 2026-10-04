import { getJson, sendDelete, sendJson } from "../api";

export type ExperienceEntry = {
    id: number;
    period: string;
    role: string;
    company: string;
    description: string[];
    sort_order: number;
    created_at: string;
};

export type ExperienceInput = {
    period: string;
    role: string;
    company: string;
    description: string[];
    sort_order: number;
};

export async function getExperience(): Promise<ExperienceEntry[]> {
    return getJson<ExperienceEntry[]>("/api/experience", "Failed to load experience.");
}

export function createExperienceEntry(
    input: ExperienceInput,
    token: string,
): Promise<ExperienceEntry> {
    return sendJson<ExperienceEntry>(
        "/api/experience",
        token,
        "POST",
        input,
        "Failed to save experience entry.",
    );
}

export function updateExperienceEntry(
    id: number,
    input: ExperienceInput,
    token: string,
): Promise<ExperienceEntry> {
    return sendJson<ExperienceEntry>(
        `/api/experience/${id}`,
        token,
        "PUT",
        input,
        "Failed to save experience entry.",
    );
}

export async function deleteExperienceEntry(
    id: number,
    token: string,
): Promise<void> {
    return sendDelete(
        `/api/experience/${id}`,
        token,
        "Failed to delete experience entry.",
    );
}
