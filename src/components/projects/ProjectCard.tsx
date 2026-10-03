import { Link } from "react-router";

import { ContentImage } from "@/components/ui";
import type { Project } from "@/services/projects/projects";
import { AccessLedger } from "./AccessLedger";

type ProjectCardProps = {
    project: Project;
    index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
    const { title, description, stack, year, category, thumbnail } = project;
    return (
        <article
            className="
                group
                flex
                h-full
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-(--glass-border)
                bg-(--glass-bg)
                shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)]
                transition-[background-color,border-color]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:bg-(--glass-bg-strong)
                hover:shadow-[inset_0_1px_0_var(--glass-highlight),0_0_0_1px_var(--accent-strong)/20,0_16px_40px_-20px_var(--accent-strong)/35]
            "
        >
            <div className="relative aspect-video overflow-hidden border-b border-(--line)">
                <ContentImage
                    src={thumbnail}
                    alt={`${title} preview`}
                    imageClassName="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        group-hover:scale-[1.04]
                    "
                    placeholderClassName="h-full w-full"
                />

                <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md">
                    {String(index + 1).padStart(2, "0")}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite)">
                    <span>{year}</span>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    <span>{category}</span>
                </div>

                <h3 className="mt-3 font-display text-[22px] leading-tight text-(--ink)">
                    {title}
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-(--graphite)">
                    {description}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                    {stack.map((technology) => (
                        <span
                            key={technology}
                            className="
                                rounded-full
                                border
                                border-(--accent-strong)/50
                                px-2.5
                                py-1
                                font-mono
                                text-[9.5px]
                                text-(--graphite)
                                transition-colors
                                duration-500
                                group-hover:border-(--accent-strong)
                                group-hover:text-(--ink)
                            "
                        >
                            {technology}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-5">
                    <AccessLedger project={project} />
                </div>

                {project.has_case_study && (
                    <div className="mt-3">
                        <Link
                            to={`/projects#project-${project.id}`}
                            className="
                                font-mono
                                text-[11px]
                                text-(--accent-strong)
                                hover:underline
                            "
                        >
                            Read case study →
                        </Link>
                    </div>
                )}
            </div>
        </article>
    );
}