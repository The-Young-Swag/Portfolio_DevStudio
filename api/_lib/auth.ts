import { timingSafeEqual } from "node:crypto";

function tokensEqual(presented: string, expected: string): boolean {
    const a = Buffer.from(presented, "utf8");
    const b = Buffer.from(expected, "utf8");

    if (a.length !== b.length) {
        return false;
    }

    return timingSafeEqual(a, b);
}

function presentedToken(request: Request): string {
    const header = request.headers.get("authorization") ?? "";

    if (!header.toLowerCase().startsWith("bearer ")) {
        return "";
    }

    return header.slice("bearer ".length).trim();
}

export function requireAdmin(request: Request): Response | null {
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
        console.error("ADMIN_TOKEN is not set on the server.");
        return Response.json(
            { error: "Server is missing ADMIN_TOKEN" },
            { status: 500 },
        );
    }

    if (!tokensEqual(presentedToken(request), adminToken.trim())) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    return null;
}
