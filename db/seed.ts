import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getDb } from "../api/_lib/db.js";
import { projects } from "../src/constants/projects.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

async function applySchema(): Promise<void> {
    const schema = readFileSync(join(rootDir, "db", "schema.sql"), "utf8");
    const statements = schema
        .split(";")
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

    const db = getDb();
    for (const statement of statements) {
        await db.execute(statement);
    }
}

async function seedProjects(): Promise<void> {
    const db = getDb();
    const existing = await db.execute("SELECT COUNT(*) AS count FROM projects");
    const firstRow = existing.rows[0] as unknown as
        | Record<string, unknown>
        | undefined;
    const count = typeof firstRow?.count === "number" ? firstRow.count : 0;

    if (count > 0) {
        console.log(`projects already seeded (${count} rows), skipping.`);
        return;
    }

    for (const [index, project] of projects.entries()) {
        await db.execute({
            sql: "INSERT INTO projects (title, description, stack, year, category, thumbnail, highlights, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                project.title,
                project.description,
                JSON.stringify(project.stack),
                project.year,
                project.category,
                project.thumbnail,
                JSON.stringify(project.highlights),
                index,
            ],
        });
    }

    console.log(`seeded ${projects.length} projects.`);
}

await applySchema();
await seedProjects();
