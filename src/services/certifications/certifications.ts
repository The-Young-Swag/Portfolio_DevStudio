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

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
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

async function readErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    const body = (await response.json().catch(() => null)) as {
        error?: string;
    } | null;

    return body?.error ?? fallback;
}

async function writeCertification(
    path: string,
    token: string,
    method: string,
    input: CertificationInput,
): Promise<Certification> {
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
            await readErrorMessage(response, "Failed to save certification."),
        );
    }

    return response.json() as Promise<Certification>;
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
    const response = await fetch(`/api/certifications/${id}`, {
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
        await readErrorMessage(response, "Failed to delete certification."),
    );
}
