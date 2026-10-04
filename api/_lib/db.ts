import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
    if (client) {
        return client;
    }

    const url = process.env.TURSO_DATABASE_URL;

    if (!url) {
        throw new Error("Server is missing TURSO_DATABASE_URL");
    }

    const authToken = process.env.TURSO_AUTH_TOKEN;

    client = authToken
        ? createClient({ url, authToken })
        : createClient({ url });

    return client;
}

export function resetDbClient(): void {
    client = null;
}
