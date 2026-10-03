import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getDb } from "../api/_lib/db.js";
import { projects } from "../src/constants/projects.js";
import { certifications } from "../src/constants/certifications.js";
import { experiences } from "../src/constants/experience.js";

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

async function seedCertifications(): Promise<void> {
    const db = getDb();
    const existing = await db.execute(
        "SELECT COUNT(*) AS count FROM certifications",
    );
    const firstRow = existing.rows[0] as unknown as
        | Record<string, unknown>
        | undefined;
    const count = typeof firstRow?.count === "number" ? firstRow.count : 0;

    if (count > 0) {
        console.log(`certifications already seeded (${count} rows), skipping.`);
        return;
    }

    for (const [index, certification] of certifications.entries()) {
        await db.execute({
            sql: "INSERT INTO certifications (name, issuer, year, credential, badge, code, accent, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                certification.name,
                certification.issuer,
                certification.year,
                certification.credential,
                certification.badge,
                certification.code,
                certification.accent,
                index,
            ],
        });
    }

    console.log(`seeded ${certifications.length} certifications.`);
}

async function seedExperience(): Promise<void> {
    const db = getDb();
    const existing = await db.execute(
        "SELECT COUNT(*) AS count FROM experience",
    );
    const firstRow = existing.rows[0] as unknown as
        | Record<string, unknown>
        | undefined;
    const count = typeof firstRow?.count === "number" ? firstRow.count : 0;

    if (count > 0) {
        console.log(`experience already seeded (${count} rows), skipping.`);
        return;
    }

    for (const [index, entry] of experiences.entries()) {
        await db.execute({
            sql: "INSERT INTO experience (period, role, company, description, sort_order) VALUES (?, ?, ?, ?, ?)",
            args: [
                entry.period,
                entry.role,
                entry.company,
                JSON.stringify(entry.description),
                index,
            ],
        });
    }

    console.log(`seeded ${experiences.length} experience entries.`);
}

await applySchema();
await seedProjects();
await seedCertifications();
await seedExperience();
