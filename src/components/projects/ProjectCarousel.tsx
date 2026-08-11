import { projects } from "@/constants/projects";

export function ProjectCarousel() {
    return (
        <div className="relative">
            <div
                className="
                    flex gap-5 overflow-x-auto pb-4
                    snap-x snap-mandatory
                    scrollbar-none
                "
            >
                {projects.map((project) => (
                    <article
                        key={project.title}
                        className="
                            group glass
                            relative w-[min(380px,85vw)] shrink-0 snap-start
                            overflow-hidden rounded-2xl

                            transition-[background-color,box-shadow]
                            duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]

                            hover:bg-(--glass-bg-strong)
                            hover:shadow-[inset_0_1px_0_var(--glass-highlight),0_0_0_1px_var(--accent-strong)/20,0_16px_40px_-20px_var(--accent-strong)/35]
                        "
                    >
                        <div className="relative aspect-video overflow-hidden border-b border-(--line)">
                            <img
                                src={project.thumbnail}
                                alt={`${project.title} preview`}
                                className="
                                    h-full w-full object-cover
                                    transition-transform duration-700
                                    ease-[cubic-bezier(0.22,1,0.36,1)]
                                    group-hover:scale-[1.04]
                                "
                            />
                        </div>

                        <div className="p-5">
                            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite)">
                                <span>{project.year}</span>
                                <span aria-hidden="true" className="opacity-40">·</span>
                                <span>{project.category}</span>
                            </div>

                            <h3 className="mt-3 font-display text-[24px] leading-tight text-(--ink)">
                                {project.title}
                            </h3>

                            <p className="mt-2 text-[13px] leading-5 text-(--graphite)">
                                {project.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-1.5">
                                {project.stack.map((technology) => (
                                    <span
                                        key={technology}
                                        className="
                                            rounded-full border border-(--accent-strong)/50
                                            px-2.5 py-1
                                            font-mono text-[9.5px]
                                            text-(--graphite)

                                            transition-colors duration-500
                                            group-hover:border-(--accent-strong)
                                            group-hover:text-(--ink)
                                        "
                                    >
                                        {technology}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}