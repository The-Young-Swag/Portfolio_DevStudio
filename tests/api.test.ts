import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DB_FILE = join(tmpdir(), `portfolio-api-test-${process.pid}.db`);
const ADMIN_TOKEN = "test-admin-token";

process.env.TURSO_DATABASE_URL = `file:${DB_FILE}`;
process.env.ADMIN_TOKEN = ADMIN_TOKEN;

const { getDb } = await import("../api/_lib/db.js");
const router = await import("../api/[...path].js");
const { toProfile } = await import("../api/_lib/profile.js");

const AUTH = {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json",
};

function jsonRequest(path: string, method: string, body: unknown, token?: string) {
    return new Request(`http://localhost${path}`, {
        method,
        headers: token === undefined ? undefined : { ...AUTH, Authorization: `Bearer ${token}` },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function authedJson(path: string, method: string, body?: unknown) {
    return jsonRequest(path, method, body, ADMIN_TOKEN);
}

function uploadRequest(
    route: string,
    file: File | null,
    withAuth: boolean,
    extra?: Record<string, string>,
) {
    const form = new FormData();

    if (file) {
        form.append("file", file);
    }

    for (const [key, value] of Object.entries(extra ?? {})) {
        form.append(key, value);
    }

    return new Request(`http://localhost${route}`, {
        method: "POST",
        headers: withAuth ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : undefined,
        body: form,
    });
}

async function tableCount(table: string): Promise<number> {
    const db = getDb();
    const result = await db.execute({ sql: `SELECT COUNT(*) AS n FROM ${table}`, args: [] });
    return (result.rows[0] as unknown as { n: number }).n;
}

const PNG_BYTES = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
);

const PDF_BYTES = Buffer.from("%PDF-1.4\n1 0 obj\n", "utf8");

async function uploadImage(bytes: Buffer, type: string, name: string): Promise<{ id: number; url: string }> {
    const response = await router.POST(
        uploadRequest("/api/images", new File([bytes], name, { type }), true),
    );
    assert.equal(response.status, 201);
    return (await response.json()) as { id: number; url: string };
}

async function uploadPdf(name: string, bytes: Buffer = PDF_BYTES): Promise<{ id: number; url: string; filename: string }> {
    const response = await router.POST(
        uploadRequest("/api/files", new File([bytes], name, { type: "application/pdf" }), true, {
            fallbackName: "certificate.pdf",
        }),
    );
    assert.equal(response.status, 201);
    return (await response.json()) as { id: number; url: string; filename: string };
}

before(async () => {
    const schema = readFileSync("db/schema.sql", "utf8");
    const db = getDb();

    for (const statement of schema
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)) {
        await db.execute(statement);
    }
});

after(() => {
    try {
        unlinkSync(DB_FILE);
    } catch {
        // Already removed or never created.
    }
});

describe("auth and server environment", () => {
    it("accepts the correct token on the session endpoint", async () => {
        const response = await router.GET(
            new Request("http://localhost/api/admin/session", {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            }),
        );
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { ok: true });
    });

    it("rejects wrong, missing, and malformed tokens with 401", async () => {
        const wrong = await router.GET(
            new Request("http://localhost/api/admin/session", {
                headers: { Authorization: "Bearer wrong" },
            }),
        );
        assert.equal(wrong.status, 401);
        assert.deepEqual(await wrong.json(), { error: "Unauthorized." });

        const missing = await router.GET(
            new Request("http://localhost/api/admin/session"),
        );
        assert.equal(missing.status, 401);

        const garbage = await router.GET(
            new Request("http://localhost/api/admin/session", {
                headers: { Authorization: "Token abc" },
            }),
        );
        assert.equal(garbage.status, 401);
    });

    it("accepts a whitespace-padded token", async () => {
        const response = await router.GET(
            new Request("http://localhost/api/admin/session", {
                headers: { Authorization: "Bearer   test-admin-token\n" },
            }),
        );
        assert.equal(response.status, 200);
    });

    it("returns 500 when ADMIN_TOKEN is unset", async () => {
        delete process.env.ADMIN_TOKEN;
        try {
            const response = await router.GET(
                new Request("http://localhost/api/admin/session", {
                    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
                }),
            );
            assert.equal(response.status, 500);
            assert.deepEqual(await response.json(), {
                error: "Server is missing ADMIN_TOKEN",
            });
        } finally {
            process.env.ADMIN_TOKEN = ADMIN_TOKEN;
        }
    });

    it("returns 500 when TURSO_DATABASE_URL is unset", async () => {
        delete process.env.TURSO_DATABASE_URL;
        try {
            const response = await router.GET(new Request("http://localhost/api/projects"));
            assert.equal(response.status, 500);
            assert.deepEqual(await response.json(), {
                error: "Server is missing TURSO_DATABASE_URL",
            });
        } finally {
            process.env.TURSO_DATABASE_URL = `file:${DB_FILE}`;
        }
    });
});

describe("admin session check", () => {
    const realFetch = globalThis.fetch;

    after(() => {
        globalThis.fetch = realFetch;
    });

    function stubFetch(body: string, contentType: string, status = 200) {
        globalThis.fetch = (async () =>
            new Response(body, {
                status,
                headers: { "Content-Type": contentType },
            })) as typeof fetch;
    }

    it("unlocks only on an { ok: true } body", async () => {
        const { checkAdminSession } = await import("../src/services/api.js");

        stubFetch(JSON.stringify({ ok: true }), "application/json");
        await checkAdminSession("anything");

        stubFetch(JSON.stringify({ ok: false }), "application/json");
        await assert.rejects(() => checkAdminSession("fake"), /rejected/);
    });

    it("rejects a 200 HTML page instead of unlocking", async () => {
        const { checkAdminSession } = await import("../src/services/api.js");

        stubFetch("<!doctype html><html></html>", "text/html");
        await assert.rejects(() => checkAdminSession("fake"), /rejected/);
    });

    it("reports a network failure without unlocking", async () => {
        const { checkAdminSession } = await import("../src/services/api.js");

        globalThis.fetch = (() => Promise.reject(new Error("down"))) as typeof fetch;
        await assert.rejects(() => checkAdminSession("fake"), /Unable to reach/);
    });
});

describe("projects", () => {
    const valid = {
        title: "T",
        description: "",
        stack: [],
        year: 2025,
        category: "",
        thumbnail: "",
        highlights: [],
        repo_url: "",
        live_url: "",
        sort_order: 0,
    };

    it("reads an empty list, validates, and enforces auth", async () => {
        const empty = await router.GET(new Request("http://localhost/api/projects"));
        assert.equal(empty.status, 200);
        assert.deepEqual(await empty.json(), []);

        assert.equal(
            (await router.POST(jsonRequest("/api/projects", "POST", valid))).status,
            401,
        );
        assert.equal(
            (
                await router.POST(
                    jsonRequest("/api/projects", "POST", { title: "" }, ADMIN_TOKEN),
                )
            ).status,
            400,
        );
    });

    it("creates, updates, deletes, and 404s", async () => {
        const createdResponse = await router.POST(
            authedJson("/api/projects", "POST", valid),
        );
        assert.equal(createdResponse.status, 201);
        const created = (await createdResponse.json()) as { id: number };

        const updated = await router.PUT(
            authedJson(`/api/projects/${created.id}`, "PUT", { ...valid, title: "T2" }),
        );
        assert.equal(updated.status, 200);

        const missing = await router.PUT(
            authedJson("/api/projects/999", "PUT", valid),
        );
        assert.equal(missing.status, 404);

        const deleted = await router.DELETE(
            authedJson(`/api/projects/${created.id}`, "DELETE"),
        );
        assert.equal(deleted.status, 204);

        const deletedAgain = await router.DELETE(
            authedJson(`/api/projects/${created.id}`, "DELETE"),
        );
        assert.equal(deletedAgain.status, 404);
    });

    it("keeps SQL injection attempts inert", async () => {
        const evil = "a'; DROP TABLE projects; --";
        const createdResponse = await router.POST(
            authedJson("/api/projects", "POST", { ...valid, title: evil }),
        );
        assert.equal(createdResponse.status, 201);
        const created = (await createdResponse.json()) as { id: number; title: string };
        assert.equal(created.title, evil);

        const listed = (await (await router.GET(new Request("http://localhost/api/projects"))).json()) as { id: number }[];
        assert.ok(listed.some((row) => row.id === created.id));

        const badId = await router.DELETE(
            authedJson("/api/projects/1%20OR%201=1", "DELETE"),
        );
        assert.equal(badId.status, 400);

        await router.DELETE(authedJson(`/api/projects/${created.id}`, "DELETE"));
    });

    it("round-trips access states and validates them", async () => {
        assert.equal(
            (
                await router.POST(
                    authedJson("/api/projects", "POST", { ...valid, source_access: "hidden" }),
                )
            ).status,
            400,
        );

        const createdResponse = await router.POST(
            authedJson("/api/projects", "POST", {
                ...valid,
                source_access: "private",
                demo_access: "internal",
                access_note: "VPN",
                has_case_study: true,
                case_screenshots: [{ url: "https://cdn.example/1.webp", caption: "One" }],
            }),
        );
        assert.equal(createdResponse.status, 201);
        const created = (await createdResponse.json()) as {
            id: number;
            source_access: string;
            has_case_study: boolean;
            case_screenshots: { url: string }[];
        };
        assert.equal(created.source_access, "private");
        assert.equal(created.has_case_study, true);
        assert.equal(created.case_screenshots.length, 1);

        await router.DELETE(authedJson(`/api/projects/${created.id}`, "DELETE"));
    });
});

describe("certifications", () => {
    const valid = {
        name: "N",
        issuer: "",
        year: "",
        credential: "",
        badge: "",
        code: "",
        accent: "blue",
        image: "",
        link: "",
        sort_order: 0,
    };

    it("reads, validates, and enforces auth", async () => {
        assert.equal((await router.GET(new Request("http://localhost/api/certifications"))).status, 200);
        assert.equal(
            (await router.POST(jsonRequest("/api/certifications", "POST", valid))).status,
            401,
        );
        assert.equal(
            (
                await router.POST(
                    jsonRequest("/api/certifications", "POST", { name: "" }, ADMIN_TOKEN),
                )
            ).status,
            400,
        );
    });

    it("enforces one level of nesting", async () => {
        const parentResponse = await router.POST(
            authedJson("/api/certifications", "POST", valid),
        );
        const parent = (await parentResponse.json()) as { id: number };

        const childResponse = await router.POST(
            authedJson("/api/certifications", "POST", { ...valid, parent_id: parent.id }),
        );
        assert.equal(childResponse.status, 201);
        const child = (await childResponse.json()) as { id: number };

        const grandchild = await router.POST(
            authedJson("/api/certifications", "POST", { ...valid, parent_id: child.id }),
        );
        assert.equal(grandchild.status, 400);

        const selfParent = await router.PUT(
            authedJson(`/api/certifications/${child.id}`, "PUT", {
                ...valid,
                parent_id: child.id,
            }),
        );
        assert.equal(selfParent.status, 400);

        const missingParent = await router.POST(
            authedJson("/api/certifications", "POST", { ...valid, parent_id: 999 }),
        );
        assert.equal(missingParent.status, 400);

        await router.DELETE(authedJson(`/api/certifications/${parent.id}`, "DELETE"));
    });

    it("cascade-deletes children including their files and images", async () => {
        const image = await uploadImage(PNG_BYTES, "image/png", "a.png");
        const pdf = await uploadPdf("c.pdf");

        const parentResponse = await router.POST(
            authedJson("/api/certifications", "POST", {
                ...valid,
                image: image.url,
                pdf: pdf.url,
            }),
        );
        const parent = (await parentResponse.json()) as { id: number };

        const childImage = await uploadImage(PNG_BYTES, "image/png", "b.png");
        const childPdf = await uploadPdf("d.pdf");
        await router.POST(
            authedJson("/api/certifications", "POST", {
                ...valid,
                parent_id: parent.id,
                image: childImage.url,
                pdf: childPdf.url,
            }),
        );

        const imagesBefore = await tableCount("images");
        const filesBefore = await tableCount("files");

        const deleted = await router.DELETE(
            authedJson(`/api/certifications/${parent.id}`, "DELETE"),
        );
        assert.equal(deleted.status, 204);

        const remaining = await getDb().execute({
            sql: "SELECT COUNT(*) AS n FROM certifications WHERE parent_id = ? OR id = ?",
            args: [parent.id, parent.id],
        });
        assert.equal((remaining.rows[0] as unknown as { n: number }).n, 0);
        assert.equal(await tableCount("images"), imagesBefore - 2);
        assert.equal(await tableCount("files"), filesBefore - 2);
    });
});

describe("experience", () => {
    it("covers CRUD, validation, 404s, and auth", async () => {
        assert.equal((await router.GET(new Request("http://localhost/api/experience"))).status, 200);
        assert.equal(
            (await router.POST(jsonRequest("/api/experience", "POST", { role: "R" }))).status,
            401,
        );
        assert.equal(
            (
                await router.POST(
                    jsonRequest("/api/experience", "POST", { role: "" }, ADMIN_TOKEN),
                )
            ).status,
            400,
        );

        const createdResponse = await router.POST(
            authedJson("/api/experience", "POST", { role: "R" }),
        );
        assert.equal(createdResponse.status, 201);
        const created = (await createdResponse.json()) as { id: number };

        assert.equal(
            (await router.PUT(authedJson(`/api/experience/${created.id}`, "PUT", { role: "R2" }))).status,
            200,
        );
        assert.equal(
            (await router.PUT(authedJson("/api/experience/999", "PUT", { role: "R" }))).status,
            404,
        );
        assert.equal(
            (await router.DELETE(authedJson(`/api/experience/${created.id}`, "DELETE"))).status,
            204,
        );
    });
});

describe("stack items", () => {
    it("validates enums and covers CRUD", async () => {
        assert.equal((await router.GET(new Request("http://localhost/api/stack-items"))).status, 200);
        const valid = { name: "Go", category: "language" };

        assert.equal(
            (
                await router.POST(
                    jsonRequest("/api/stack-items", "POST", { ...valid, category: "ide" }, ADMIN_TOKEN),
                )
            ).status,
            400,
        );
        assert.equal(
            (
                await router.POST(
                    jsonRequest("/api/stack-items", "POST", { ...valid, level: "expert" }, ADMIN_TOKEN),
                )
            ).status,
            400,
        );

        const createdResponse = await router.POST(
            authedJson("/api/stack-items", "POST", { ...valid, level: "learning", is_core: true }),
        );
        assert.equal(createdResponse.status, 201);
        const created = (await createdResponse.json()) as {
            id: number;
            level: string;
            is_core: boolean;
        };
        assert.equal(created.level, "learning");
        assert.equal(created.is_core, true);

        assert.equal(
            (await router.DELETE(authedJson(`/api/stack-items/${created.id}`, "DELETE"))).status,
            204,
        );
        assert.equal(
            (await router.DELETE(authedJson(`/api/stack-items/${created.id}`, "DELETE"))).status,
            404,
        );
    });
});

describe("social links", () => {
    it("covers CRUD, validation, 404s, and auth", async () => {
        assert.equal((await router.GET(new Request("http://localhost/api/social-links"))).status, 200);
        assert.equal(
            (await router.POST(jsonRequest("/api/social-links", "POST", { label: "L" }))).status,
            401,
        );
        assert.equal(
            (
                await router.POST(
                    jsonRequest("/api/social-links", "POST", { label: "" }, ADMIN_TOKEN),
                )
            ).status,
            400,
        );

        const createdResponse = await router.POST(
            authedJson("/api/social-links", "POST", { label: "L" }),
        );
        assert.equal(createdResponse.status, 201);
        const created = (await createdResponse.json()) as { id: number };

        assert.equal(
            (await router.PUT(authedJson(`/api/social-links/${created.id}`, "PUT", { label: "L2" }))).status,
            200,
        );
        assert.equal(
            (await router.DELETE(authedJson(`/api/social-links/${created.id}`, "DELETE"))).status,
            204,
        );
    });
});

describe("profile", () => {
    const base = {
        name: "N",
        portrait: {},
        hero_stats: null,
        also_true: null,
        contact_heading: null,
        contact_title: null,
        contact_intro: null,
        contact_email_label: null,
        footer_note: null,
    };

    it("reads 404 when missing, validates, and enforces auth", async () => {
        assert.equal((await router.GET(new Request("http://localhost/api/profile"))).status, 404);
        assert.equal(
            (await router.PUT(jsonRequest("/api/profile", "PUT", base))).status,
            401,
        );
        assert.equal(
            (await router.PUT(jsonRequest("/api/profile", "PUT", { ...base, name: "" }, ADMIN_TOKEN))).status,
            400,
        );
    });

    it("round-trips portrait states, stats, also-true, and contact fields", async () => {
        const full = {
            ...base,
            portrait: { "profile-default": { image: "/api/images/1", alt: "Alt" } },
            hero_stats: [{ label: "S", value: "1", suffix: "", icon: "star", live: null }],
            also_true: [{ text: "T", icon: "bot" }],
            contact_heading: "H",
            contact_title: "T",
            contact_intro: "I",
            contact_email_label: "E",
            footer_note: "F",
        };
        const updated = await router.PUT(authedJson("/api/profile", "PUT", full));
        assert.equal(updated.status, 200);
        const body = (await updated.json()) as {
            portrait: Record<string, { image: string; alt: string }>;
            hero_stats: unknown[];
            also_true: unknown[];
            contact_heading: string;
            footer_note: string;
        };
        assert.equal(body.portrait["profile-default"].alt, "Alt");
        assert.equal(body.hero_stats.length, 1);
        assert.equal(body.also_true.length, 1);
        assert.equal(body.contact_heading, "H");
        assert.equal(body.footer_note, "F");
    });

    it("runs the resume lifecycle", async () => {
        const linkPut = await router.PUT(
            authedJson("/api/profile", "PUT", { ...base, resume: "https://cdn.example/r.pdf" }),
        );
        assert.equal(linkPut.status, 200);
        const withLink = (await (await router.GET(new Request("http://localhost/api/profile"))).json()) as { resume: string };
        assert.equal(withLink.resume, "https://cdn.example/r.pdf");

        const first = await uploadPdf("a.pdf");
        await router.PUT(authedJson("/api/profile", "PUT", { ...base, resume: first.url }));
        assert.equal(await tableCount("files"), 1);

        const second = await uploadPdf("b.pdf");
        await router.PUT(
            authedJson("/api/profile", "PUT", { ...base, resume: second.url }),
        );
        assert.equal(await tableCount("files"), 1);

        await router.PUT(authedJson("/api/profile", "PUT", { ...base, resume: "" }));
        assert.equal(await tableCount("files"), 0);
        const removed = (await (await router.GET(new Request("http://localhost/api/profile"))).json()) as { resume: string };
        assert.equal(removed.resume, "");
    });

    it("returns null for a never-set resume", () => {
        assert.equal(toProfile({ name: "x" }).resume, null);
    });
});

describe("images", () => {
    it("accepts png, jpeg, webp, and avif", async () => {
        for (const [bytes, type, name] of [
            [PNG_BYTES, "image/png", "a.png"],
            [Buffer.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg", "a.jpg"],
            [Buffer.concat([Buffer.from("RIFF....WEBP", "ascii")]), "image/webp", "a.webp"],
            [
                Buffer.concat([Buffer.from([0, 0, 0, 20]), Buffer.from("ftypavif", "ascii"), Buffer.alloc(16)]),
                "image/avif",
                "a.avif",
            ],
        ] as const) {
            const response = await router.POST(
                uploadRequest("/api/images", new File([bytes], name, { type }), true),
            );
            assert.equal(response.status, 201, name);
        }
    });

    it("rejects svg, spoofed, and oversize uploads with 401 without token", async () => {
        const svg = new File(["<svg></svg>"], "a.svg", { type: "image/svg+xml" });
        assert.equal(
            (await router.POST(uploadRequest("/api/images", svg, true))).status,
            400,
        );

        const spoofed = new File(["nope"], "a.png", { type: "image/png" });
        assert.equal(
            (await router.POST(uploadRequest("/api/images", spoofed, true))).status,
            400,
        );

        const big = new File([Buffer.alloc(400 * 1024 + 1)], "big.png", { type: "image/png" });
        assert.equal(
            (await router.POST(uploadRequest("/api/images", big, true))).status,
            400,
        );

        assert.equal(
            (await router.POST(uploadRequest("/api/images", spoofed, false))).status,
            401,
        );
    });

    it("serves bytes with immutable headers and cleans up orphans", async () => {
        const stored = await uploadImage(PNG_BYTES, "image/png", "a.png");
        const served = await router.GET(new Request(`http://localhost${stored.url}`));
        assert.equal(served.status, 200);
        assert.equal(served.headers.get("Content-Type"), "image/png");
        assert.equal(served.headers.get("X-Content-Type-Options"), "nosniff");
        assert.equal(
            served.headers.get("Cache-Control"),
            "public, max-age=31536000, s-maxage=31536000, immutable",
        );
        assert.deepEqual(
            Array.from(new Uint8Array(await served.arrayBuffer())),
            Array.from(PNG_BYTES),
        );

        const before = await tableCount("images");
        const created = (await (
            await router.POST(
                authedJson("/api/projects", "POST", {
                    title: "T",
                    year: 2025,
                    thumbnail: stored.url,
                }),
            )
        ).json()) as { id: number };

        await router.PUT(
            authedJson(`/api/projects/${created.id}`, "PUT", {
                title: "T",
                year: 2025,
                thumbnail: "",
            }),
        );
        assert.equal(await tableCount("images"), before - 1);

        const second = await uploadImage(PNG_BYTES, "image/png", "b.png");
        const created2 = (await (
            await router.POST(
                authedJson("/api/projects", "POST", {
                    title: "T",
                    year: 2025,
                    thumbnail: second.url,
                }),
            )
        ).json()) as { id: number };
        await router.DELETE(authedJson(`/api/projects/${created2.id}`, "DELETE"));
        assert.equal(await tableCount("images"), before - 1);

        const third = await uploadImage(PNG_BYTES, "image/png", "c.png");
        assert.ok(third.id > second.id, "ids are never reused");
    });
});

describe("files", () => {
    it("verifies the PDF signature, caps size, and sanitizes names", async () => {
        const text = new File(["hello"], "a.pdf", { type: "application/pdf" });
        assert.equal(
            (await router.POST(uploadRequest("/api/files", text, true))).status,
            400,
        );

        const big = new File([Buffer.alloc(2 * 1024 * 1024 + 1)], "big.pdf", {
            type: "application/pdf",
        });
        assert.equal(
            (await router.POST(uploadRequest("/api/files", big, true))).status,
            400,
        );

        const evil = await router.POST(
            uploadRequest("/api/files", new File([PDF_BYTES], "../../x.pdf", { type: "application/pdf" }), true),
        );
        assert.equal(evil.status, 201);
        assert.equal(((await evil.json()) as { filename: string }).filename, "x.pdf");
    });

    it("serves inline PDFs with the stored filename and cleans up", async () => {
        const stored = await uploadPdf("doc.pdf");
        const served = await router.GET(new Request(`http://localhost${stored.url}`));
        assert.equal(served.status, 200);
        assert.equal(served.headers.get("Content-Type"), "application/pdf");
        assert.equal(
            served.headers.get("Content-Disposition"),
            `inline; filename="${stored.filename}"`,
        );
        assert.equal(served.headers.get("X-Content-Type-Options"), "nosniff");
        assert.equal(
            served.headers.get("Cache-Control"),
            "public, max-age=31536000, s-maxage=31536000, immutable",
        );

        const before = await tableCount("files");
        const created = (await (
            await router.POST(
                authedJson("/api/certifications", "POST", { name: "N", pdf: stored.url }),
            )
        ).json()) as { id: number };
        await router.PUT(
            authedJson(`/api/certifications/${created.id}`, "PUT", { name: "N", pdf: "" }),
        );
        assert.equal(await tableCount("files"), before - 1);
    });
});

describe("router", () => {
    it("returns 404 for unknown routes", async () => {
        for (const path of ["/api/nope", "/api/projects/1/extra", "/api"]) {
            const response = await router.GET(new Request(`http://localhost${path}`));
            assert.equal(response.status, 404, path);
            assert.deepEqual(await response.json(), { error: "Not found" });
        }
    });

    it("returns 405 with an Allow header for wrong methods", async () => {
        const collectionDelete = await router.DELETE(new Request("http://localhost/api/projects"));
        assert.equal(collectionDelete.status, 405);
        assert.equal(
            collectionDelete.headers.get("Allow"),
            "GET, POST, PUT, DELETE",
        );

        const itemPost = await router.POST(new Request("http://localhost/api/projects/1"));
        assert.equal(itemPost.status, 405);

        const profileItem = await router.GET(new Request("http://localhost/api/profile/1"));
        assert.equal(profileItem.status, 405);
        assert.equal(profileItem.headers.get("Allow"), "GET, PUT");

        const imagesDelete = await router.DELETE(new Request("http://localhost/api/images"));
        assert.equal(imagesDelete.status, 405);
        assert.equal(imagesDelete.headers.get("Allow"), "GET, POST");
    });

    it("tolerates trailing slashes", async () => {
        const collection = await router.GET(new Request("http://localhost/api/projects/"));
        assert.equal(collection.status, 200);

        const missing = await router.PUT(
            authedJson("/api/social-links/999/", "PUT", { label: "L" }),
        );
        assert.equal(missing.status, 404);
    });

    it("rejects non-integer ids with 400", async () => {
        const bad = await router.DELETE(
            authedJson("/api/projects/abc", "DELETE"),
        );
        assert.equal(bad.status, 400);
        assert.deepEqual(await bad.json(), { error: "Invalid project id." });

        const injection = await router.DELETE(
            authedJson("/api/projects/1%20OR%201=1", "DELETE"),
        );
        assert.equal(injection.status, 400);
    });

    it("leaves the GitHub contributions route standalone", async () => {
        delete process.env.GITHUB_TOKEN;
        delete process.env.GITHUB_USERNAME;
        const github = await import("../api/github/contributions.js");
        const response = await github.GET();
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), {
            error: "GitHub API configuration is missing.",
        });
    });
});

describe("seed", () => {
    it("works on a fresh database, then skips non-empty tables", async () => {
        const { resetDbClient } = await import("../api/_lib/db.js");
        const { runSeed } = await import("../db/seed.js");
        const freshDb = join(tmpdir(), `portfolio-seed-test-${process.pid}.db`);
        const previousUrl = process.env.TURSO_DATABASE_URL;

        async function count(table: string): Promise<number> {
            const result = await getDb().execute({
                sql: `SELECT COUNT(*) AS n FROM ${table}`,
                args: [],
            });
            return (result.rows[0] as unknown as { n: number }).n;
        }

        try {
            process.env.TURSO_DATABASE_URL = `file:${freshDb}`;
            resetDbClient();
            await runSeed();

            assert.ok((await count("projects")) > 0);
            assert.ok((await count("stack_items")) > 0);
            assert.equal(await count("profile"), 1);
            const projectsBefore = await count("projects");

            await runSeed();
            assert.equal(await count("projects"), projectsBefore);
        } finally {
            if (previousUrl === undefined) {
                delete process.env.TURSO_DATABASE_URL;
            } else {
                process.env.TURSO_DATABASE_URL = previousUrl;
            }
            resetDbClient();

            try {
                unlinkSync(freshDb);
            } catch {
                // Already removed.
            }
        }
    });
});
