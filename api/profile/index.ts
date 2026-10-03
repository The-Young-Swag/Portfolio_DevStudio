import { isAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { profileSchema, toProfile } from "../_lib/profile.js";

const SELECT_COLUMNS =
    "id, name, headline, location, availability, description, github, linkedin, email, resume FROM profile";

export async function GET() {
    try {
        const db = getDb();
        const result = await db.execute({
            sql: `SELECT ${SELECT_COLUMNS} WHERE id = 1`,
            args: [],
        });

        const row = result.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Profile not found." },
                { status: 404 },
            );
        }

        return Response.json(toProfile(row), {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Profile GET error:", error);
        return Response.json(
            { error: "Unable to load profile." },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request) {
    if (!isAdmin(request)) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid profile data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        await db.execute({
            sql: "INSERT INTO profile (id, name, headline, location, availability, description, github, linkedin, email, resume) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = ?, headline = ?, location = ?, availability = ?, description = ?, github = ?, linkedin = ?, email = ?, resume = ?",
            args: [
                input.name,
                input.headline,
                input.location,
                input.availability,
                input.description,
                input.github,
                input.linkedin,
                input.email,
                input.resume,
                input.name,
                input.headline,
                input.location,
                input.availability,
                input.description,
                input.github,
                input.linkedin,
                input.email,
                input.resume,
            ],
        });

        const selected = await db.execute({
            sql: `SELECT ${SELECT_COLUMNS} WHERE id = 1`,
            args: [],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Unable to load profile." },
                { status: 500 },
            );
        }

        return Response.json(toProfile(row));
    } catch (error) {
        console.error("Profile PUT error:", error);
        return Response.json(
            { error: "Unable to update profile." },
            { status: 500 },
        );
    }
}
