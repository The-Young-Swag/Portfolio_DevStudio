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

export type LinkAction =
    | { kind: "link"; href: string }
    | { kind: "text"; text: string }
    | { kind: "none" };

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
