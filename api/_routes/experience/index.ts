import { checkServerEnv } from "../../_lib/env.js";
import { requireAdmin } from "../../_lib/auth.js";
import { getDb } from "../../_lib/db.js";
import { experienceSchema, toExperienceEntry } from "../../_lib/experience.js";

export async function GET() {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

    try {
        const db = getDb();
        const result = await db.execute(
            "SELECT id, period, role, company, description, sort_order, created_at FROM experience ORDER BY sort_order ASC, id ASC",
        );

        const entries = result.rows.map((row: unknown) =>
            toExperienceEntry(row as Record<string, unknown>),
        );

        return Response.json(entries, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Experience GET error:", error);
        return Response.json(
            { error: "Unable to load experience." },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = experienceSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid experience data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const inserted = await db.execute({
            sql: "INSERT INTO experience (period, role, company, description, sort_order) VALUES (?, ?, ?, ?, ?)",
            args: [
                input.period,
                input.role,
                input.company,
                JSON.stringify(input.description),
                input.sort_order,
            ],
        });

        const id = Number(inserted.lastInsertRowid);
        const created = await db.execute({
            sql: "SELECT id, period, role, company, description, sort_order, created_at FROM experience WHERE id = ?",
            args: [id],
        });

        const row = created.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Unable to load created experience entry." },
                { status: 500 },
            );
        }

        return Response.json(toExperienceEntry(row), { status: 201 });
    } catch (error) {
        console.error("Experience POST error:", error);
        return Response.json(
            { error: "Unable to create experience entry." },
            { status: 500 },
        );
    }
}
