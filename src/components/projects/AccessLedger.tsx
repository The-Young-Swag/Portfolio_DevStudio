import type { Project } from "@/services/projects/projects";

type SourceState =
    | { kind: "public"; url: string }
    | { kind: "private" }
    | { kind: "hidden" };

type DemoState =
    | { kind: "public"; url: string }
    | { kind: "internal" }
    | { kind: "offline" }
    | { kind: "none" }
    | { kind: "hidden" };

function sourceState(project: Project): SourceState {
    const access = project.source_access ?? (project.repo_url !== "" ? "public" : null);

    if (access === "public" && project.repo_url !== "") {
        return { kind: "public", url: project.repo_url };
    }

    if (access === "private") {
        return { kind: "private" };
    }

    return { kind: "hidden" };
}

function demoState(project: Project): DemoState {
    const access = project.demo_access ?? (project.live_url !== "" ? "public" : null);

    if (access === "public" && project.live_url !== "") {
        return { kind: "public", url: project.live_url };
    }

    if (access === "internal" || access === "offline" || access === "none") {
        return { kind: access };
    }

    return { kind: "hidden" };
}

function StatusDot({ kind }: { kind: "open" | "restricted" | "unavailable" }) {
    if (kind === "open") {
        return (
            <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-(--accent-strong)"
            />
        );
    }

    if (kind === "restricted") {
        return (
            <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full border border-(--accent-strong)"
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full border border-dashed border-(--graphite)"
        />
    );
}

const DEMO_LABELS = {
    internal: "Internal network only",
    offline: "Offline",
    none: "No demo",
} as const;

export function AccessLedger({ project }: { project: Project }) {
    const source = sourceState(project);
    const demo = demoState(project);

    if (source.kind === "hidden" && demo.kind === "hidden" && project.access_note === "") {
        return null;
    }

    return (
        <div>
            {source.kind !== "hidden" && (
                <p className="flex items-center gap-2 font-mono text-[10.5px] text-(--graphite)">
                    <StatusDot kind={source.kind === "public" ? "open" : "restricted"} />
                    <span className="uppercase tracking-[0.12em] text-(--graphite-soft)">
                        Source code
                    </span>
                    {source.kind === "public" ? (
                        <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent-strong) hover:underline"
                        >
                            Public repository ↗
                        </a>
                    ) : (
                        <span className="text-(--ink)">Private</span>
                    )}
                </p>
            )}

            {demo.kind !== "hidden" && (
                <p className="mt-1.5 flex items-center gap-2 font-mono text-[10.5px] text-(--graphite)">
                    <StatusDot
                        kind={demo.kind === "public" ? "open" : demo.kind === "none" ? "unavailable" : "restricted"}
                    />
                    <span className="uppercase tracking-[0.12em] text-(--graphite-soft)">
                        Live demo
                    </span>
                    {demo.kind === "public" ? (
                        <a
                            href={demo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent-strong) hover:underline"
                        >
                            Live demo ↗
                        </a>
                    ) : (
                        <span className="text-(--ink)">{DEMO_LABELS[demo.kind]}</span>
                    )}
                </p>
            )}

            {project.access_note !== "" && (
                <p className="mt-1.5 text-[12px] leading-relaxed text-(--graphite)">
                    {project.access_note}
                </p>
            )}
        </div>
    );
}
