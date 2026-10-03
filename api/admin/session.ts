import { requireAdmin } from "../_lib/auth.js";

export async function GET(request: Request) {
    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }

    return Response.json({ ok: true });
}
