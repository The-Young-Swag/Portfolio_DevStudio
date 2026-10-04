export function checkServerEnv(): Response | null {
    if (!process.env.TURSO_DATABASE_URL) {
        console.error("TURSO_DATABASE_URL is not set on the server.");
        return Response.json(
            { error: "Server is missing TURSO_DATABASE_URL" },
            { status: 500 },
        );
    }

    return null;
}
