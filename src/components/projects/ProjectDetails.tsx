import { useState } from "react";

import type { Project } from "@/services/projects/projects";
import { ContentImage, ImageLightbox } from "@/components/ui";
import { AccessLedger } from "./AccessLedger";

type ProjectDetailsProps = {
    projects: Project[];
};

function CaseStudy({ project }: { project: Project }) {
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

    const blocks = [
        { label: "Problem", text: project.case_problem },
        { label: "My role", text: project.case_role },
        { label: "What I built", text: project.case_solution },
        { label: "Result", text: project.case_result },
    ].filter((block) => block.text !== "");

    if (blocks.length === 0 && project.case_screenshots.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 rounded-xl border border-(--line) p-4 sm:p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--accent-strong)">
                Case study
            </p>

            {blocks.map((block) => (
                <div key={block.label} className="mt-4">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                        {block.label}
                    </p>
                    <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-(--graphite)">
                        {block.text}
                    </p>
                </div>
            ))}

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

export function ProjectDetails({ projects }: ProjectDetailsProps) {
    return (
        <div className="mt-6 divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-160">
            {projects.map((project) => (
                <div
                    key={project.id}
                    id={`project-${project.id}`}
                    className="grid scroll-mt-24 gap-4 p-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-8 sm:p-7"
                >
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-(--line)">
                            <ContentImage
                                src={project.thumbnail}
                                alt={`${project.title} preview`}
                                imageClassName="h-full w-full object-cover"
                                placeholderClassName="h-full w-full"
                            />
                        </div>

                        <p className="mt-3">{project.year}</p>
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

                        <div className="mt-4">
                            <AccessLedger project={project} />
                        </div>

                        {project.has_case_study && <CaseStudy project={project} />}
                    </div>
                </div>
            ))}
        </div>
    );
}