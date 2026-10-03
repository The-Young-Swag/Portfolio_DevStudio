import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
    if (client) {
        return client;
    }

    const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
    const authToken = process.env.TURSO_AUTH_TOKEN;

    client = authToken
        ? createClient({ url, authToken })
        : createClient({ url });

    return client;
}
