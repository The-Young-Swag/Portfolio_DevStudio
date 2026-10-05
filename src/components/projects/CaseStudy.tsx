import { useState } from "react";

import type { Project } from "@/services/projects/projects";
import { ContentImage, ImageLightbox } from "@/components/ui";

function hasRestrictedAccess(project: Project): boolean {
    return (
        project.source_access === "private" ||
        project.demo_access === "internal" ||
        project.demo_access === "offline"
    );
}

export function CaseStudy({ project }: { project: Project }) {
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

    const columns = [
        { label: "Problem", text: project.case_problem },
        { label: "What I built", text: project.case_solution },
        { label: "Result", text: project.case_result },
    ].filter((block) => block.text !== "");

    const showWhyNoLink =
        hasRestrictedAccess(project) && project.access_note !== "";

    if (columns.length === 0 && project.case_screenshots.length === 0 && !showWhyNoLink) {
        return null;
    }

    return (
        <div className="mt-6 rounded-xl border border-(--line) p-4 sm:p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--accent-strong)">
                Case study
            </p>

            <h4 className="mt-2 font-display text-[17px] font-medium leading-snug text-(--ink)">
                {project.title}
            </h4>

            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                {project.year}
                {project.case_role !== "" && ` · ${project.case_role}`}
            </p>

            {columns.length > 0 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {columns.map((block) => (
                        <div key={block.label}>
                            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                                {block.label}
                            </p>
                            <p className="mt-1 text-[13px] leading-relaxed text-(--graphite)">
                                {block.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {showWhyNoLink && (
                <p className="mt-4 text-[12.5px] leading-relaxed text-(--graphite)">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                        Why there&apos;s no link:{" "}
                    </span>
                    {project.access_note}
                </p>
            )}

            {project.case_screenshots.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {project.case_screenshots.map((shot) => (
                        <figure key={shot.url} className="min-w-0">
                            <button
                                type="button"
                                onClick={() =>
                                    setLightbox({
                                        src: shot.url,
                                        alt: shot.caption === "" ? `${project.title} screenshot` : shot.caption,
                                    })
                                }
                                className="block w-full overflow-hidden rounded-xl border border-(--line)"
                            >
                                <ContentImage
                                    src={shot.url}
                                    alt={shot.caption === "" ? `${project.title} screenshot` : shot.caption}
                                    imageClassName="aspect-video h-full w-full object-cover"
                                    placeholderClassName="aspect-video w-full"
                                />
                            </button>

                            {shot.caption !== "" && (
                                <figcaption className="mt-1.5 font-mono text-[10.5px] text-(--graphite-soft)">
                                    {shot.caption}
                                </figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            )}

            {lightbox !== null && (
                <ImageLightbox
                    src={lightbox.src}
                    alt={lightbox.alt}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    );
}
