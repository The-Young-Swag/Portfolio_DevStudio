import { getJson, sendDelete, sendJson } from "../api";

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
    return getJson<Certification[]>("/api/certifications", "Failed to load certifications.");
}

export type CertificationInput = {
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    accent: "blue" | "purple" | "viridian";
    sort_order: number;
};

async function writeCertification(
    path: string,
    token: string,
    method: string,
    input: CertificationInput,
): Promise<Certification> {
    return sendJson<Certification>(path, token, method, input, "Failed to save certification.");
}

export function createCertification(
    input: CertificationInput,
    token: string,
): Promise<Certification> {
    return writeCertification("/api/certifications", token, "POST", input);
}

export function updateCertification(
    id: number,
    input: CertificationInput,
    token: string,
): Promise<Certification> {
    return writeCertification(`/api/certifications/${id}`, token, "PUT", input);
}

export async function deleteCertification(
    id: number,
    token: string,
): Promise<void> {
    return sendDelete(`/api/certifications/${id}`, token, "Failed to delete certification.");
}
