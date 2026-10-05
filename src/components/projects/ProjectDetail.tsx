import { ExternalLink, Lock } from "lucide-react";

import type { Project } from "@/services/projects/projects";
import { StatusBadge } from "./StatusBadge";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectInfoCard } from "./ProjectInfoCard";
import { CaseStudy } from "./CaseStudy";
import { demoAction, sourceAction, projectPanelId } from "./projectStatus";
import type { LinkAction } from "./projectStatus";

function stripBullets(text: string): string {
    return text.replace(/^(-|–|—|\*)\s+/, "");
}

function HeaderAction({
    label,
    action,
    primary,
}: {
    label: string;
    action: LinkAction;
    primary?: boolean;
}) {
    if (action.kind === "none") {
        return null;
    }

    const icon =
        action.kind === "link" ? (
            <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
            <Lock size={16} strokeWidth={2} aria-hidden="true" />
        );

    const body = (
        <>
            {icon}
            <span>
                <small className="mb-0.5 block font-mono text-[10.5px] text-(--graphite-soft)">
                    {label}
                </small>
                {action.kind === "link" ? "Open" : action.text}
            </span>
        </>
    );

    if (action.kind === "link") {
        return (
            <a
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className={`
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-[0.875rem]
                    px-3.5
                    py-2.5
                    text-[13.5px]
                    font-medium
                    transition-colors
                    duration-150
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-(--accent-strong)
                    ${
                        primary
                            ? "bg-(--accent-strong) text-white hover:bg-(--accent-deep)"
                            : "border border-(--glass-border) bg-(--glass-bg) text-(--ink) hover:border-(--accent-strong)"
                    }
                `}
            >
                {body}
            </a>
        );
    }

    return (
        <span
            className="
                inline-flex
                items-center
                gap-2.5
                rounded-[0.875rem]
                border
                border-dashed
                border-(--line)
                px-3.5
                py-2.5
                text-[13.5px]
                text-(--graphite)
            "
        >
            {body}
        </span>
    );
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
    const hasGallery = project.case_screenshots.length > 0;
    const demo = demoAction(project);
    const source = sourceAction(project);
    const hasActions = demo.kind !== "none" || source.kind !== "none";

    return (
        <article
            id={projectPanelId(project.id)}
            role={tabId === null ? undefined : "tabpanel"}
            aria-labelledby={tabId ?? undefined}
            aria-label={tabId === null ? project.title : undefined}
            tabIndex={tabId === null ? undefined : 0}
            className="@container min-w-0"
        >
            <header className="flex flex-wrap items-end justify-between gap-5">
                <div className="min-w-0 flex-1 basis-96">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <StatusBadge project={project} />

                        {project.year !== 0 && (
                            <span className="font-mono text-[12px] text-(--graphite-soft)">
                                {project.year}
                            </span>
                        )}
                    </div>

                    <h2 className="mb-3 break-words font-display text-[clamp(1.875rem,4.5cqi,2.875rem)] font-semibold leading-[1.1] tracking-tight text-(--ink)">
                        {project.title}
                    </h2>

                    {project.description !== "" && (
                        <p className="max-w-[68ch] break-words text-[16px] leading-[1.75] text-(--graphite)">
                            {project.description}
                        </p>
                    )}
                </div>

                {hasActions && (
                    <div className="flex flex-wrap gap-2.5">
                        <HeaderAction label="Live demo" action={demo} primary />
                        <HeaderAction label="Source code" action={source} />
                    </div>
                )}
            </header>

            {hasGallery && (
                <div className="mt-8">
                    <ProjectGallery
                        title={project.title}
                        shots={project.case_screenshots}
                    />
                </div>
            )}

            <div className="mt-8 grid gap-8 @aside:grid-cols-[minmax(0,1fr)_19rem] @aside:gap-12">
                <div className="min-w-0 space-y-10 @aside:order-first">
                    {features.length >= 2 && (
                        <section aria-label="Features">
                            <h3 className="mb-3 font-display text-[22px] text-(--ink)">
                                Key features
                            </h3>

                            <ul className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
                                {features.map((feature, index) => (
                                    <li
                                        key={`${feature}-${index}`}
                                        className="
                                            break-words
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
                            <h3 className="mb-3 font-display text-[22px] text-(--ink)">
                                Highlights
                            </h3>

                            <p className="max-w-[65ch] break-words leading-[1.75] text-(--graphite)">
                                {features[0]}
                            </p>
                        </section>
                    )}

                    {project.has_case_study && <CaseStudy project={project} />}
                </div>

                <div className="order-first min-w-0 @aside:order-none">
                    <ProjectInfoCard project={project} />
                </div>
            </div>
        </article>
    );
}
