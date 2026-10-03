export function isAdmin(request: Request): boolean {
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
        return false;
    }

    const header = request.headers.get("authorization");

    return header === `Bearer ${adminToken}`;
}
