import type { Project } from "@/services/projects/projects";
import { demoState, hasLedgerContent, sourceState } from "./projectStatus";

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

    if (!hasLedgerContent(project)) {
        return null;
    }

    return (
        <div>
            {source.kind !== "hidden" && (
                <p className="flex items-center gap-2 font-mono text-[10.5px] text-(--graphite)">
                    <StatusDot kind="open" />
                    <span className="w-24 shrink-0 uppercase tracking-[0.12em] text-(--graphite-soft)">
                        Source code
                    </span>
                    <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-(--accent-strong) hover:underline"
                    >
                        View repository ↗
                    </a>
                </p>
            )}

            {demo.kind !== "hidden" && (
                <p className="mt-1.5 flex items-center gap-2 font-mono text-[10.5px] text-(--graphite)">
                    <StatusDot
                        kind={demo.kind === "public" ? "open" : demo.kind === "none" ? "unavailable" : "restricted"}
                    />
                    <span className="w-24 shrink-0 uppercase tracking-[0.12em] text-(--graphite-soft)">
                        Live demo
                    </span>
                    {demo.kind === "public" ? (
                        <a
                            href={demo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent-strong) hover:underline"
                        >
                            Open live demo ↗
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
