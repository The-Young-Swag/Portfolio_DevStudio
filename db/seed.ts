import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getDb } from "../api/_lib/db.js";
import { projects } from "../src/constants/projects.js";
import { certifications } from "../src/constants/certifications.js";
import { experiences } from "../src/constants/experience.js";
import { stackItems } from "../src/constants/stack.js";
import { profile } from "../src/constants/profile.js";
import { socialLinks } from "../src/constants/socialLinks.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function describeTarget(url: string): string {
    if (url.startsWith("file:")) {
        return `local file (${url})`;
    }

    try {
        return `remote host (${new URL(url).host})`;
    } catch {
        return "remote database";
    }
}

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
            sql: "INSERT INTO projects (title, description, stack, year, category, thumbnail, highlights, repo_url, live_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                project.title,
                project.description,
                JSON.stringify(project.stack),
                project.year,
                project.category,
                project.thumbnail,
                JSON.stringify(project.highlights),
                "",
                "",
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
            sql: "INSERT INTO certifications (name, issuer, year, credential, badge, code, accent, image, link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                certification.name,
                certification.issuer,
                certification.year,
                certification.credential,
                certification.badge,
                certification.code,
                certification.accent,
                "",
                "",
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

async function seedStackItems(): Promise<void> {
    const db = getDb();
    const existing = await db.execute("SELECT COUNT(*) AS count FROM stack_items");
    const firstRow = existing.rows[0] as unknown as
        | Record<string, unknown>
        | undefined;
    const count = typeof firstRow?.count === "number" ? firstRow.count : 0;

    if (count > 0) {
        console.log(`stack items already seeded (${count} rows), skipping.`);
        return;
    }

    for (const [index, item] of stackItems.entries()) {
        await db.execute({
            sql: "INSERT INTO stack_items (name, category, level, since_year, is_core, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
            args: [
                item.name,
                item.category,
                item.level,
                item.since_year,
                item.is_core ? 1 : 0,
                index,
            ],
        });
    }

    console.log(`seeded ${stackItems.length} stack items.`);
}

async function seedProfile(): Promise<void> {
    const db = getDb();
    const existing = await db.execute("SELECT id FROM profile WHERE id = 1");
    if (existing.rows.length > 0) {
        console.log("profile already seeded, skipping.");
        return;
    }

    await db.execute({
        sql: "INSERT INTO profile (id, name, headline, location, availability, description, github, linkedin, email, resume, portrait, hero_stats, also_true, contact_heading, contact_title, contact_intro, contact_email_label, footer_note) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
            profile.name,
            profile.headline,
            profile.location,
            profile.availability,
            profile.description,
            profile.github,
            profile.linkedin,
            profile.email,
            profile.resume,
            JSON.stringify(profile.portrait),
            JSON.stringify(profile.hero_stats),
            JSON.stringify(profile.also_true),
            profile.contact_heading,
            profile.contact_title,
            profile.contact_intro,
            profile.contact_email_label,
            profile.footer_note,
        ],
    });

    console.log("seeded profile.");
}

async function seedSocialLinks(): Promise<void> {
    const db = getDb();
    const existing = await db.execute("SELECT COUNT(*) AS count FROM social_links");
    const firstRow = existing.rows[0] as unknown as
        | Record<string, unknown>
        | undefined;
    const count = typeof firstRow?.count === "number" ? firstRow.count : 0;

    if (count > 0) {
        console.log(`social links already seeded (${count} rows), skipping.`);
        return;
    }

    for (const [index, link] of socialLinks.entries()) {
        await db.execute({
            sql: "INSERT INTO social_links (label, href, icon, sort_order) VALUES (?, ?, ?, ?)",
            args: [link.label, link.href, link.icon, index],
        });
    }

    console.log(`seeded ${socialLinks.length} social links.`);
}

export async function runSeed(): Promise<void> {
    if (!process.env.TURSO_DATABASE_URL) {
        process.env.TURSO_DATABASE_URL = "file:local.db";
    }

    console.log(
        `Seed targeting ${describeTarget(process.env.TURSO_DATABASE_URL)}.`,
    );

    await applySchema();
    await seedProjects();
    await seedCertifications();
    await seedExperience();
    await seedStackItems();
    await seedProfile();
    await seedSocialLinks();
}

const invokedAsScript =
    process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsScript) {
    await runSeed();
}
