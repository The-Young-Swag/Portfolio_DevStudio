import { checkServerEnv } from "../../_lib/env.js";
import { requireAdmin } from "../../_lib/auth.js";
import { getDb } from "../../_lib/db.js";
import { deleteStoredFile } from "../../_lib/files.js";
import { deleteStoredImage } from "../../_lib/images.js";
import {
    collectPortraitImages,
    profileSchema,
    toProfile,
} from "../../_lib/profile.js";

const SELECT_COLUMNS =
    "id, name, headline, location, availability, description, github, linkedin, email, resume, portrait, hero_stats, also_true, contact_heading, contact_title, contact_intro, contact_email_label, footer_note FROM profile";

export async function GET() {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

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
        const previous = await db.execute({
            sql: "SELECT portrait, resume FROM profile WHERE id = 1",
            args: [],
        });

        const previousRow = previous.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        const previousProfile = previousRow ? toProfile(previousRow) : null;
        const previousImages = previousProfile ? previousProfile.portrait : {};
        const removedImages = collectPortraitImages(previousImages).filter(
            (url) => !collectPortraitImages(input.portrait).includes(url),
        );
        const previousResume = previousProfile?.resume ?? null;

        await db.execute({
            sql: "INSERT INTO profile (id, name, headline, location, availability, description, github, linkedin, email, resume, portrait, hero_stats, also_true, contact_heading, contact_title, contact_intro, contact_email_label, footer_note) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = ?, headline = ?, location = ?, availability = ?, description = ?, github = ?, linkedin = ?, email = ?, resume = ?, portrait = ?, hero_stats = ?, also_true = ?, contact_heading = ?, contact_title = ?, contact_intro = ?, contact_email_label = ?, footer_note = ?",
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
                JSON.stringify(input.portrait),
                input.hero_stats === null ? null : JSON.stringify(input.hero_stats),
                input.also_true === null ? null : JSON.stringify(input.also_true),
                input.contact_heading,
                input.contact_title,
                input.contact_intro,
                input.contact_email_label,
                input.footer_note,
                input.name,
                input.headline,
                input.location,
                input.availability,
                input.description,
                input.github,
                input.linkedin,
                input.email,
                input.resume,
                JSON.stringify(input.portrait),
                input.hero_stats === null ? null : JSON.stringify(input.hero_stats),
                input.also_true === null ? null : JSON.stringify(input.also_true),
                input.contact_heading,
                input.contact_title,
                input.contact_intro,
                input.contact_email_label,
                input.footer_note,
            ],
        });

        for (const url of removedImages) {
            await deleteStoredImage(db, url);
        }

        if (previousResume !== input.resume) {
            await deleteStoredFile(db, previousResume);
        }

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
