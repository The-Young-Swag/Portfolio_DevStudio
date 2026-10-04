export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export function isUnauthorized(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
}

async function readErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    const body = (await response.json().catch(() => null)) as {
        error?: string;
    } | null;

    return body?.error ?? fallback;
}

export async function getJson<T>(path: string, fallbackMessage: string): Promise<T> {
    const response = await fetch(path, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new ApiError(
            response.status,
            await readErrorMessage(response, fallbackMessage),
        );
    }

    return response.json() as Promise<T>;
}

export async function sendJson<T>(
    path: string,
    token: string,
    method: string,
    body: unknown,
    fallbackMessage: string,
): Promise<T> {
    const response = await fetch(path, {
        method,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new ApiError(
            response.status,
            await readErrorMessage(response, fallbackMessage),
        );
    }

    return response.json() as Promise<T>;
}

export async function sendDelete(
    path: string,
    token: string,
    fallbackMessage: string,
): Promise<void> {
    const response = await fetch(path, {
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
        await readErrorMessage(response, fallbackMessage),
    );
}

export type UploadedFile = {
    id: number;
    url: string;
    filename: string;
    size: number;
};

export async function uploadFile(
    file: File,
    fallbackName: string,
    token: string,
): Promise<UploadedFile> {
    const form = new FormData();
    form.append("file", file);
    form.append("fallbackName", fallbackName);

    const response = await fetch("/api/files", {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: form,
    });

    if (!response.ok) {
        throw new ApiError(
            response.status,
            await readErrorMessage(response, "Failed to upload file."),
        );
    }

    return response.json() as Promise<UploadedFile>;
}

export type UploadedImage = {
    id: number;
    url: string;
};

export async function uploadImage(blob: Blob, token: string): Promise<UploadedImage> {
    const form = new FormData();
    form.append("file", blob, "image.webp");

    const response = await fetch("/api/images", {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: form,
    });

    if (!response.ok) {
        throw new ApiError(
            response.status,
            await readErrorMessage(response, "Failed to upload image."),
        );
    }

    return response.json() as Promise<UploadedImage>;
}

export async function checkAdminSession(token: string): Promise<void> {
    let response: Response;

    try {
        response = await fetch("/api/admin/session", {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    } catch {
        throw new ApiError(0, "Unable to reach the server. Check your connection.");
    }

    if (!response.ok) {
        const message = await readErrorMessage(response, "Unable to verify the token.");

        throw new ApiError(
            response.status,
            response.status === 401 ? "That token was rejected. Try again." : message,
        );
    }

    const body = (await response.json().catch(() => null)) as {
        ok?: unknown;
    } | null;

    if (!body || typeof body !== "object") {
        throw new ApiError(
            response.status,
            "The server did not return an API response. If you are on localhost, run vercel dev instead of npm run dev.",
        );
    }

    if (body.ok !== true) {
        throw new ApiError(401, "That token was rejected. Try again.");
    }
}
