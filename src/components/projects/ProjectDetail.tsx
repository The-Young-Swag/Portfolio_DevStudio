import type { Project } from "@/services/projects/projects";
import { StatusBadge } from "./StatusBadge";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectInfoCard } from "./ProjectInfoCard";
import { CaseStudy } from "./CaseStudy";
import { projectPanelId } from "./projectStatus";

function stripBullets(text: string): string {
    return text.replace(/^(-|–|—|\*)\s+/, "");
}

export function ProjectDetail({
    project,
    tabId,
}: {
    project: Project;
    tabId: string | null;
}) {
    const features = project.highlights
        .map((highlight) => stripBullets(highlight).trim())
        .filter((highlight) => highlight !== "");
    const hasMainContent = project.description !== "" || features.length > 0;

    return (
        <article
            id={projectPanelId(project.id)}
            role={tabId === null ? undefined : "tabpanel"}
            aria-labelledby={tabId ?? undefined}
            aria-label={tabId === null ? project.title : undefined}
            tabIndex={tabId === null ? undefined : 0}
            className="min-w-0"
        >
            <header>
                <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge project={project} />

                    {project.year !== 0 && (
                        <span className="font-mono text-[12px] text-(--graphite-soft)">
                            {project.year}
                        </span>
                    )}
                </div>

                <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-(--ink) sm:text-4xl">
                    {project.title}
                </h2>

                {project.description !== "" && (
                    <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-(--graphite) sm:text-[17px]">
                        {project.description}
                    </p>
                )}
            </header>

            {project.case_screenshots.length > 0 && (
                <div className="mt-8">
                    <ProjectGallery title={project.title} shots={project.case_screenshots} />
                </div>
            )}

            {hasMainContent ? (
                <div className="mt-10 grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="min-w-0 space-y-10">
                    {project.description !== "" && (
                        <section aria-label="Overview">
                            <h3 className="font-display text-2xl text-(--ink)">
                                Overview
                            </h3>

                            <p className="mt-3 max-w-[65ch] leading-[1.75] text-(--graphite)">
                                {project.description}
                            </p>
                        </section>
                    )}

                    {features.length >= 2 && (
                        <section aria-label="Features">
                            <h3 className="font-display text-2xl text-(--ink)">
                                Key features
                            </h3>

                            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                                {features.map((feature, index) => (
                                    <li
                                        key={`${feature}-${index}`}
                                        className="
                                            rounded-2xl
                                            border
                                            border-(--glass-border)
                                            bg-(--glass-bg)
                                            p-5
                                            text-[13.5px]
                                            leading-relaxed
                                            text-(--graphite)
                                            shadow-[inset_0_1px_0_var(--glass-highlight)]
                                        "
                                    >
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {features.length === 1 && (
                        <section aria-label="Features">
                            <h3 className="font-display text-2xl text-(--ink)">
                                Highlights
                            </h3>

                            <p className="mt-3 max-w-[65ch] leading-[1.75] text-(--graphite)">
                                {features[0]}
                            </p>
                        </section>
                    )}
                </div>

                    <ProjectInfoCard project={project} />
                </div>
            ) : (
                <div className="mt-10 max-w-xl">
                    <ProjectInfoCard project={project} />
                </div>
            )}

            {project.has_case_study && (
                <div className="mt-10">
                    <CaseStudy project={project} />
                </div>
            )}
        </article>
    );
}
