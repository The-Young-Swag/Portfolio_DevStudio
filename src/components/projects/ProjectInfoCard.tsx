import { TechPill } from "@/components/ui";
import type { Project } from "@/services/projects/projects";

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
        <div
            className="
                rounded-2xl
                border
                border-(--glass-border)
                bg-(--glass-bg)
                p-6
                shadow-[inset_0_1px_0_var(--glass-highlight)]
                backdrop-blur-xl
                backdrop-saturate-160
                @aside:sticky
                @aside:top-6
                @aside:self-start
            "
        >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                    Project info
                </p>

                {rows.length > 0 && (
                    <dl className="mt-4">
                        {rows.map((row) => (
                            <div key={row.label} className="mb-3.5 last:mb-0">
                                <dt className="font-mono text-[11px] text-(--graphite-soft)">
                                    {row.label}
                                </dt>
                                <dd className="mt-0.5 break-words text-[14px] text-(--ink)">
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}

                {project.stack.length > 0 && (
                    <div className="mt-5">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                            Stack
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {project.stack.map((technology) => (
                                <TechPill
                                    key={technology}
                                    name={technology}
                                    href="/stack"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
    );
}
