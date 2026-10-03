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
