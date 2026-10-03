export type Certification = {
    id: number;
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    accent: "blue" | "purple" | "viridian";
    sort_order: number;
    created_at: string;
};

export async function getCertifications(): Promise<Certification[]> {
    const response = await fetch("/api/certifications", {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load certifications.");
    }

    return response.json() as Promise<Certification[]>;
}
