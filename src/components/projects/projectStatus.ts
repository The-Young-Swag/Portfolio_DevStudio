import type { Project } from "@/services/projects/projects";

export type ProjectStatus = "live" | "internal" | "private" | "undeployed";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    live: "Live",
    internal: "Internal network",
    private: "Private",
    undeployed: "Not deployed",
};

export function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function hasLiveDemoUrl(project: Project): boolean {
    const demoPublic =
        project.demo_access === null || project.demo_access === "public";

    return demoPublic && isHttpUrl(project.live_url);
}

export function getProjectStatus(project: Project): ProjectStatus {
    if (hasLiveDemoUrl(project)) {
        return "live";
    }

    const text = `${project.demo_access ?? ""} ${project.access_note}`.toLowerCase();

    if (text.includes("internal")) {
        return "internal";
    }

    if (project.source_access === "private") {
        return "private";
    }

    return "undeployed";
}

export function projectTabId(id: number) {
    return `project-tab-${id}`;
}

export function projectPanelId(id: number) {
    return `project-${id}`;
}

// Cover tones cycle deterministically by project id so every tile gets a
// distinct stage without storing presentation in the data.
const COVER_TONES = [
    "from-[#1c3a2c] to-[#4d7a52]",
    "from-[#1b2b44] to-[#3f6aa3]",
    "from-[#2a2438] to-[#6a54a0]",
    "from-[#33291c] to-[#8a6c3a]",
];

export function coverToneFor(id: number) {
    return COVER_TONES[((id % COVER_TONES.length) + COVER_TONES.length) % COVER_TONES.length];
}

export type LinkAction =
    | { kind: "link"; href: string }
    | { kind: "text"; text: string }
    | { kind: "none" };

export type SourceState = { kind: "public"; url: string } | { kind: "hidden" };

export type DemoState =
    | { kind: "public"; url: string }
    | { kind: "internal" }
    | { kind: "offline" }
    | { kind: "none" }
    | { kind: "hidden" };

export function sourceState(project: Project): SourceState {
    const access = project.source_access ?? (project.repo_url !== "" ? "public" : null);

    if (access === "public" && project.repo_url !== "") {
        return { kind: "public", url: project.repo_url };
    }

    // A private repository is hidden entirely: no link, no label.
    return { kind: "hidden" };
}

export function demoState(project: Project): DemoState {
    const access = project.demo_access ?? (project.live_url !== "" ? "public" : null);

    if (access === "public" && project.live_url !== "") {
        return { kind: "public", url: project.live_url };
    }

    if (access === "internal" || access === "offline" || access === "none") {
        return { kind: access };
    }

    return { kind: "hidden" };
}

export function hasLedgerContent(project: Project): boolean {
    return (
        sourceState(project).kind !== "hidden" ||
        demoState(project).kind !== "hidden" ||
        project.access_note !== ""
    );
}

export function sourceAction(project: Project): LinkAction {
    if (project.source_access !== "private" && isHttpUrl(project.repo_url)) {
        return { kind: "link", href: project.repo_url };
    }

    // A private repository is hidden entirely: no link, no label.
    if (project.source_access === "private") {
        return { kind: "none" };
    }

    if (project.repo_url !== "") {
        return { kind: "text", text: project.repo_url };
    }

    return { kind: "none" };
}

export function demoAction(project: Project): LinkAction {
    if (hasLiveDemoUrl(project)) {
        return { kind: "link", href: project.live_url };
    }

    if (project.demo_access === "internal") {
        return { kind: "text", text: "Internal network only" };
    }

    if (project.demo_access === "offline") {
        return { kind: "text", text: "Offline" };
    }

    if (project.demo_access === "none") {
        return { kind: "text", text: "No demo" };
    }

    if (project.live_url !== "") {
        return { kind: "text", text: project.live_url };
    }

    return { kind: "none" };
}
