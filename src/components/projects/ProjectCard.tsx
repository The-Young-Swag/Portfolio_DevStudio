import { Link } from "react-router";

import { ContentImage, TechPill } from "@/components/ui";
import type { Project } from "@/services/projects/projects";
import { AccessLedger } from "./AccessLedger";
import { hasLedgerContent } from "./projectStatus";

type ProjectCardProps = {
    project: Project;
};

function ProjectCover({ title, thumbnail }: { title: string; thumbnail: string }) {
    if (thumbnail === "") {
        return null;
    }

    return (
        <div className="relative aspect-[2/1] overflow-hidden border-b border-(--line)">
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
                    motion-safe:group-hover:scale-[1.04]
                "
                placeholderClassName="h-full w-full"
            />
        </div>
    );
}

function ProjectTags({ stack }: { stack: string[] }) {
    if (stack.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-wrap gap-1.5">
            {stack.map((technology) => (
                <TechPill key={technology} name={technology} />
            ))}
        </div>
    );
}

function ProjectFooter({ project }: { project: Project }) {
    const showLedger = hasLedgerContent(project);

    if (!showLedger && !project.has_case_study) {
        return null;
    }

    return (
        <div className="mt-auto pt-4">
            {showLedger && (
                <div className="border-t hairline pt-4">
                    <AccessLedger project={project} />
                </div>
            )}

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
    );
}

export function ProjectCard({ project }: ProjectCardProps) {
    const { title, stack, year, category, thumbnail } = project;

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
                sm:min-h-[24rem]
            "
        >
            <ProjectCover title={title} thumbnail={thumbnail} />

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite)">
                    <span className="shrink-0">{year}</span>
                    <span aria-hidden="true" className="shrink-0 opacity-40">·</span>
                    <span title={category} className="min-w-0 truncate">{category}</span>
                </div>

                <h3 className="mt-3 font-display text-[20px] leading-tight text-(--ink)">
                    {title}
                </h3>

                <ProjectTags stack={stack} />

                <ProjectFooter project={project} />
            </div>
        </article>
    );
}
