#!/usr/bin/env node
/*
 * Layout audit for the Projects page.
 *
 * For every viewport x color mode, loads /projects in a real browser and
 * reports: elements wider than their box, elements past the viewport edge,
 * overflow:hidden elements that actually clip, and sticky elements
 * overlapping the footer or each other.
 *
 * Usage: node scripts/audit-layout.mjs [baseUrl]
 * Requires: agent-browser on PATH, dev server running.
 *
 * Exit 0 with a JSON report on stdout. Triage is manual: line-clamp and
 * object-cover thumbnails clip by design and show up below on purpose.
 */
import { execFileSync } from "node:child_process";

const BASE = process.argv[2] ?? "http://localhost:5173";
const VIEWPORTS = [
    [1920, 1000],
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [768, 800],
    [414, 800],
    [375, 700],
];
const MODES = ["light", "dark"];

const SESSION = `audit-${process.pid}`;

function ab(...args) {
    return execFileSync(
        "agent-browser",
        args,
        {
            encoding: "utf8",
            env: { ...process.env, AGENT_BROWSER_SESSION: SESSION },
            timeout: 90000,
            stdio: ["ignore", "pipe", "pipe"],
        },
    ).trim();
}

const AUDIT_JS = `(() => {
    const describe = (el) => {
        const rect = el.getBoundingClientRect();
        const cls = (el.className && el.className.baseVal === undefined)
            ? String(el.className).split(/\\s+/).filter(Boolean).slice(0, 2).join(".")
            : "";
        return el.tagName.toLowerCase()
            + (el.id ? "#" + el.id : "")
            + (cls ? "." + cls : "")
            + " w" + Math.round(rect.width)
            + " [" + Math.round(rect.left) + "," + Math.round(rect.right) + "]";
    };
    const vw = window.innerWidth;
    const wide = [];
    const wideScrollers = [];
    const past = [];
    const clipped = [];
    for (const el of document.querySelectorAll("body *")) {
        if (el.scrollWidth > el.clientWidth + 2) {
            const entry = describe(el) + " sw" + el.scrollWidth;
            // A horizontal scroller is *supposed* to be wider inside.
            if (getComputedStyle(el).overflowX === "hidden") {
                wide.push(entry);
            } else {
                wideScrollers.push(entry);
            }
        }
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
            past.push(describe(el));
        }
        const cs = getComputedStyle(el);
        const hiddenX = cs.overflowX === "hidden";
        const hiddenY = cs.overflowY === "hidden";
        if ((hiddenX && el.scrollWidth > el.clientWidth + 2)
            || (hiddenY && el.scrollHeight > el.clientHeight + 2)) {
            clipped.push(describe(el)
                + (hiddenX && el.scrollWidth > el.clientWidth + 2 ? " X" : "")
                + (hiddenY && el.scrollHeight > el.clientHeight + 2 ? " Y" : ""));
        }
    }
    const stickies = [];
    for (const el of document.querySelectorAll("body *")) {
        if (getComputedStyle(el).position !== "sticky") continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        stickies.push({ name: describe(el), rect: [r.top, r.left, r.bottom, r.right] });
    }
    const overlaps = [];
    const boxes = [...stickies];
    const footer = document.querySelector("footer");
    if (footer) {
        const r = footer.getBoundingClientRect();
        boxes.push({ name: "footer", rect: [r.top, r.left, r.bottom, r.right] });
    }
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
            const [t1, l1, b1, r1] = boxes[i].rect;
            const [t2, l2, b2, r2] = boxes[j].rect;
            const iw = Math.min(r1, r2) - Math.max(l1, l2);
            const ih = Math.min(b1, b2) - Math.max(t1, t2);
            if (iw > 2 && ih > 2) overlaps.push(boxes[i].name + " x " + boxes[j].name);
        }
    }
    return JSON.stringify({
        doc: document.documentElement.scrollWidth + "/" + window.innerWidth,
        wide: wide.slice(0, 12), wideCount: wide.length,
        wideScrollers: wideScrollers.slice(0, 6), wideScrollersCount: wideScrollers.length,
        past: past.slice(0, 12), pastCount: past.length,
        clipped: clipped.slice(0, 12), clippedCount: clipped.length,
        sticky: stickies.map((s) => s.name), overlaps,
    });
})()`;

const report = [];

ab("open", `${BASE}/projects`);

for (const [width, height] of VIEWPORTS) {
    ab("set", "viewport", String(width), String(height));
    for (const mode of MODES) {
        ab(
            "eval",
            `localStorage.setItem("theme","${mode}");location.href="${BASE}/projects";"navigating"`,
        );
        // Wait for the project tabs (i.e. the settled render, not the
        // loading skeleton) before measuring, then let fonts settle.
        ab(
            "eval",
            `new Promise((resolve) => {
                const started = Date.now();
                const poll = () => {
                    if (document.querySelector('[role="tablist"] button')
                        || Date.now() - started > 20000) resolve("settled");
                    else setTimeout(poll, 250);
                };
                poll();
            })`,
        );
        ab("eval", `new Promise((r) => setTimeout(() => r("fonts"), 1500))`);
        const raw = ab("eval", AUDIT_JS);
        let parsed;
        try {
            parsed = JSON.parse(JSON.parse(raw));
        } catch {
            parsed = { error: raw.slice(0, 200) };
        }
        report.push({ viewport: `${width}x${height}`, mode, ...parsed });
        console.log(
            `${width}x${height} ${mode} doc=${parsed.doc}: wide=${parsed.wideCount} scrollers=${parsed.wideScrollersCount} past=${parsed.pastCount} clipped=${parsed.clippedCount} overlaps=${(parsed.overlaps ?? []).length}`,
        );
    }
}

console.log(JSON.stringify(report, null, 1));
