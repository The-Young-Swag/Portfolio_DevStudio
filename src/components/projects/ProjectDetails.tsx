import { projects } from "@/constants/projects";

export function ProjectDetails() {
    return (
        <div className="mt-6 divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-160">
            {projects.map((project) => (
                <div
                    key={project.title}
                    className="grid gap-4 p-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-8 sm:p-7"
                >
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                        <p>{project.year}</p>
                        <p className="mt-1 text-(--accent-strong)">
                            {project.category}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display text-[18px] font-medium leading-snug text-(--ink)">
                            {project.title}
                        </h3>

                        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-(--graphite)">
                            {project.description}
                        </p>

                        <ul className="mt-4 space-y-1.5">
                            {project.highlights.map((highlight) => (
                                <li
                                    key={highlight}
                                    className="flex gap-2.5 text-[12.5px] leading-relaxed text-(--graphite)"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-(--accent-strong)"
                                    />
                                    {highlight}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.stack.map((technology) => (
                                <span
                                    key={technology}
                                    className="rounded-full border border-(--accent-strong)/40 px-2.5 py-1 font-mono text-[9.5px] text-(--graphite)"
                                >
                                    {technology}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}