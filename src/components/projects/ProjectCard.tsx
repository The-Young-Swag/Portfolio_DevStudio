import { Link } from "react-router";

import { ContentImage, ImagePlaceholder, safeHttpUrl } from "@/components/ui";
import type { Project } from "@/services/projects/projects";
import { AccessLedger } from "./AccessLedger";
import { coverToneFor, hasLedgerContent } from "./projectStatus";

type ProjectCardProps = {
    project: Project;
};

/**
 * Cardless home tile mirroring the project page index: the thumbnail
 * whole on its tone stage, title and meta below. The access ledger and
 * case-study link stay as borderless content; the stack lives on the
 * detail page.
 */
export function ProjectCard({ project }: ProjectCardProps) {
    const { id, title, category, year } = project;
    const safeThumbnail = safeHttpUrl(project.thumbnail);
    const meta = [category, year !== 0 ? String(year) : ""]
        .filter((part) => part !== "")
        .join(" · ");
    const showLedger = hasLedgerContent(project);

    return (
        <article className="group min-w-0">
            <span
                className={`
                    flex
                    h-44
                    w-full
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    bg-linear-to-br
                    p-3
                    ${coverToneFor(id)}
                `}
            >
                {safeThumbnail !== "" ? (
                    <ContentImage
                        src={safeThumbnail}
                        alt={`${title} preview`}
                        imageClassName="h-auto max-h-full w-auto max-w-full rounded-[2px]"
                        placeholderClassName="h-full w-full"
                    />
                ) : (
                    <ImagePlaceholder className="h-full w-full rounded-2xl" />
                )}
            </span>

            <div className="min-w-0 px-1 pt-3.5">
                <h3 className="break-words font-display text-[20px] leading-tight text-(--ink)">
                    {title}
                </h3>

                {meta !== "" && (
                    <p className="mt-1 truncate text-[12.5px] text-(--graphite)">
                        {meta}
                    </p>
                )}

                {showLedger && (
                    <div className="mt-3">
                        <AccessLedger project={project} />
                    </div>
                )}

                {project.has_case_study && (
                    <div className="mt-3">
                        <Link
                            to={`/projects#project-${project.id}`}
                            className="font-mono text-[11px] text-(--accent-strong) hover:underline"
                        >
                            Read case study →
                        </Link>
                    </div>
                )}
            </div>
        </article>
    );
}
