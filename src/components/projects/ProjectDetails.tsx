import type { Project } from "@/services/projects/projects";
import { ContentImage } from "@/components/ui";
import { resolveProjectThumbnail } from "./projectThumbnails";

type ProjectDetailsProps = {
    projects: Project[];
};

export function ProjectDetails({ projects }: ProjectDetailsProps) {
    return (
        <div className="mt-6 divide-y divide-(--line) rounded-2xl border border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-160">
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="grid gap-4 p-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-8 sm:p-7"
                >
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-(--graphite-soft)">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-(--line)">
                            <ContentImage
                                src={resolveProjectThumbnail(project.thumbnail)}
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

                        {(project.repo_url !== "" || project.live_url !== "") && (
                            <div className="mt-4 flex gap-4 font-mono text-[11px]">
                                {project.repo_url !== "" && (
                                    <a
                                        href={project.repo_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-(--accent-strong) hover:underline"
                                    >
                                        Repo ↗
                                    </a>
                                )}

                                {project.live_url !== "" && (
                                    <a
                                        href={project.live_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-(--accent-strong) hover:underline"
                                    >
                                        Live ↗
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}