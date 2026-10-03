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
    const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load projects.");
    }

    return response.json() as Promise<Project[]>;
}

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
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

async function readErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    const body = (await response.json().catch(() => null)) as {
        error?: string;
    } | null;

    return body?.error ?? fallback;
}

async function writeProject(
    path: string,
    token: string,
    method: string,
    input: ProjectInput,
): Promise<Project> {
    const response = await fetch(path, {
        method,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new ApiError(
            response.status,
            await readErrorMessage(response, "Failed to save project."),
        );
    }

    return response.json() as Promise<Project>;
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
    const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 204) {
        return;
    }

    throw new ApiError(
        response.status,
        await readErrorMessage(response, "Failed to delete project."),
    );
}
