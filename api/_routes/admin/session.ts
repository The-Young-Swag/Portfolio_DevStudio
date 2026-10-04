import { checkServerEnv } from "../../_lib/env.js";
import { requireAdmin } from "../../_lib/auth.js";

export async function GET(request: Request) {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }

    return Response.json({ ok: true });
}
