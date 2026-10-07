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
    image: string;
    link: string;
    parent_id: number | null;
    pdf: string;
    badge_image: string;
    badge_link: string;
    sort_order: number;
    created_at: string;
};

export async function getCertifications(): Promise<Certification[]> {
    return getJson<Certification[]>("/api/certifications", "Failed to load certifications.");
}

/**
 * The certificates that represent themselves in lists: top-level
 * records plus orphans whose parent is gone. Child courses belong to
 * their parent and never appear on their own.
 */
export function topLevelCertifications(certifications: Certification[]): Certification[] {
    return certifications.filter(
        (certification) =>
            certification.parent_id === null ||
            !certifications.some((parent) => parent.id === certification.parent_id),
    );
}

export type CertificationInput = {
    name: string;
    issuer: string;
    year: string;
    credential: string;
    badge: string;
    code: string;
    accent: "blue" | "purple" | "viridian";
    image: string;
    link: string;
    parent_id: number | null;
    pdf: string;
    badge_image: string;
    badge_link: string;
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
