import { Link } from "react-router";

import type { Project } from "@/services/projects/projects";

/**
 * Cardless project facts: label-over-value typography plus the stack
 * as borderless links. Collapses entirely when there is nothing to show.
 */
export function ProjectInfoCard({ project }: { project: Project }) {
    // Status already shows in the detail header badge, and the demo/source
    // links live in the header actions, so neither is repeated here: every
    // fact appears once per view.
    const rows = [
        { label: "Role", value: project.case_role },
        { label: "Type", value: project.category },
    ].filter((row) => row.value !== "");

    if (rows.length === 0 && project.stack.length === 0) {
        return null;
    }

    return (
        <div className="min-w-0">
            {rows.length > 0 && (
                <dl className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-x-8 gap-y-6">
                    {rows.map((row) => (
                        <div key={row.label} className="min-w-0">
                            <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                                {row.label}
                            </dt>
                            <dd className="mt-1.5 break-words text-[15px] font-medium text-(--ink)">
                                {row.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

            {project.stack.length > 0 && (
                <div className={rows.length > 0 ? "mt-8" : ""}>
                    <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                        Stack
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {project.stack.map((technology) => (
                            <Link
                                key={technology}
                                to="/stack"
                                title={`${technology} — view on the Stack page`}
                                className="
                                    font-mono
                                    text-[12px]
                                    text-(--graphite)
                                    transition-colors
                                    duration-150
                                    hover:text-(--accent-strong)
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-(--accent-strong)
                                "
                            >
                                {technology}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
