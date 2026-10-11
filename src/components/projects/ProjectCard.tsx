import { Link } from "react-router";

import { MediaFrame } from "@/components/ui";
import type { Project } from "@/services/projects/projects";
import { projectPanelId } from "./projectStatus";

type ProjectCardProps = {
    project: Project;
};

/**
 * Cardless home tile mirroring the project page index: one unified
 * frame, title and meta below. The whole tile links to the project
 * detail, where the ledger, stack, and case study live — keeping every
 * card identical in structure and height.
 */
export function ProjectCard({ project }: ProjectCardProps) {
    const { title, category, year } = project;
    const meta = [category, year !== 0 ? String(year) : ""]
        .filter((part) => part !== "")
        .join(" · ");

    return (
        <article className="tile-lift h-full min-w-0">
            <Link
                to={`/projects#${projectPanelId(project.id)}`}
                aria-label={`${title} — view project details`}
                className="
                    flex
                    h-full
                    min-w-0
                    flex-col
                    gap-3.5
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-(--accent-strong)
                "
            >
                <MediaFrame
                    src={project.thumbnail}
                    alt={`${title} preview`}
                    ratio="16/10"
                    fit="cover-top"
                    name={title}
                    label={category}
                />

                <span className="flex min-w-0 flex-1 flex-col px-1">
                    <span className="tile-title block break-words font-display text-[20px] font-medium leading-[1.3] text-(--ink)">
                        {title}
                    </span>

                    {meta !== "" && (
                        <span className="mb-1 mt-auto block truncate pt-2 text-[12.5px] text-(--graphite)">
                            {meta}
                        </span>
                    )}
                </span>
            </Link>
        </article>
    );
}
