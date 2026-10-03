import { getJson, sendDelete, sendJson } from "../api";

export type Project = {
    id: number;
    title: string;
    description: string;
    stack: string[];
    year: number;
    category: string;
    thumbnail: string;
    highlights: string[];
    sort_order: number;
    created_at: string;
};

export async function getProjects(): Promise<Project[]> {
    return getJson<Project[]>("/api/projects", "Failed to load projects.");
}

export type ProjectInput = {
    title: string;
    description: string;
    stack: string[];
    year: number;
    category: string;
    thumbnail: string;
    highlights: string[];
    sort_order: number;
};

async function writeProject(
    path: string,
    token: string,
    method: string,
    input: ProjectInput,
): Promise<Project> {
    return sendJson<Project>(path, token, method, input, "Failed to save project.");
}

export function createProject(
    input: ProjectInput,
    token: string,
): Promise<Project> {
    return writeProject("/api/projects", token, "POST", input);
}

export function updateProject(
    id: number,
    input: ProjectInput,
    token: string,
): Promise<Project> {
    return writeProject(`/api/projects/${id}`, token, "PUT", input);
}

export async function deleteProject(
    id: number,
    token: string,
): Promise<void> {
    return sendDelete(`/api/projects/${id}`, token, "Failed to delete project.");
}
