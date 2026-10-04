import { checkServerEnv } from "../../_lib/env.js";
import { requireAdmin } from "../../_lib/auth.js";
import { getDb } from "../../_lib/db.js";
import { deleteStoredImage } from "../../_lib/images.js";
import {
    projectSchema,
    removedScreenshotUrls,
    screenshotUrls,
    toProject,
} from "../../_lib/projects.js";

function getId(request: Request): number | null {
    try {
        const parts = new URL(request.url).pathname
            .split("/")
            .filter(Boolean);
        const id = Number(parts[parts.length - 1]);

        if (!Number.isInteger(id) || id <= 0) {
            return null;
        }

        return id;
    } catch {
        return null;
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

    const id = getId(request);
    if (id === null) {
        return Response.json({ error: "Invalid project id." }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: "Invalid project data." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    try {
        const db = getDb();
        const previous = await db.execute({
            sql: "SELECT thumbnail, case_screenshots FROM projects WHERE id = ?",
            args: [id],
        });

        const previousRow = previous.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!previousRow) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        const updated = await db.execute({
            sql: "UPDATE projects SET title = ?, description = ?, stack = ?, year = ?, category = ?, thumbnail = ?, highlights = ?, repo_url = ?, live_url = ?, source_access = ?, demo_access = ?, access_note = ?, has_case_study = ?, case_problem = ?, case_role = ?, case_solution = ?, case_result = ?, case_screenshots = ?, sort_order = ? WHERE id = ?",
            args: [
                input.title,
                input.description,
                JSON.stringify(input.stack),
                input.year,
                input.category,
                input.thumbnail,
                JSON.stringify(input.highlights),
                input.repo_url,
                input.live_url,
                input.source_access,
                input.demo_access,
                input.access_note,
                input.has_case_study ? 1 : 0,
                input.case_problem,
                input.case_role,
                input.case_solution,
                input.case_result,
                JSON.stringify(input.case_screenshots),
                input.sort_order,
                id,
            ],
        });

        if (updated.rowsAffected === 0) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        if (previousRow.thumbnail !== input.thumbnail) {
            await deleteStoredImage(db, previousRow.thumbnail);
        }

        for (const url of removedScreenshotUrls(previousRow.case_screenshots, input.case_screenshots)) {
            await deleteStoredImage(db, url);
        }

        const selected = await db.execute({
            sql: "SELECT id, title, description, stack, year, category, thumbnail, highlights, repo_url, live_url, source_access, demo_access, access_note, has_case_study, case_problem, case_role, case_solution, case_result, case_screenshots, sort_order, created_at FROM projects WHERE id = ?",
            args: [id],
        });

        const row = selected.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!row) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        return Response.json(toProject(row));
    } catch (error) {
        console.error("Projects PUT error:", error);
        return Response.json(
            { error: "Unable to update project." },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }

    const id = getId(request);
    if (id === null) {
        return Response.json({ error: "Invalid project id." }, { status: 400 });
    }

    try {
        const db = getDb();
        const previous = await db.execute({
            sql: "SELECT thumbnail, case_screenshots FROM projects WHERE id = ?",
            args: [id],
        });

        const previousRow = previous.rows[0] as unknown as
            | Record<string, unknown>
            | undefined;

        if (!previousRow) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        const deleted = await db.execute({
            sql: "DELETE FROM projects WHERE id = ?",
            args: [id],
        });

        if (deleted.rowsAffected === 0) {
            return Response.json(
                { error: "Project not found." },
                { status: 404 },
            );
        }

        await deleteStoredImage(db, previousRow.thumbnail);

        for (const url of screenshotUrls(previousRow.case_screenshots)) {
            await deleteStoredImage(db, url);
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Projects DELETE error:", error);
        return Response.json(
            { error: "Unable to delete project." },
            { status: 500 },
        );
    }
}
