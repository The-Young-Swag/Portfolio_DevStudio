import { useRef } from "react";

import type { Project } from "@/services/projects/projects";
import { StatusBadge } from "./StatusBadge";
import { projectPanelId, projectTabId } from "./projectStatus";

type ProjectIndexProps = {
    projects: Project[];
    selectedId: number | null;
    onSelect: (id: number) => void;
};

export function ProjectIndex({ projects, selectedId, onSelect }: ProjectIndexProps) {
    const tabRefs = useRef(new Map<number, HTMLButtonElement>());

    function focusTab(id: number) {
        tabRefs.current.get(id)?.focus();
    }

    function selectNeighbor(currentId: number, direction: 1 | -1) {
        const index = projects.findIndex((project) => project.id === currentId);

        if (index === -1 || projects.length === 0) {
            return;
        }

        const next = projects[(index + direction + projects.length) % projects.length];
        onSelect(next.id);
        focusTab(next.id);
    }

    function handleKeyDown(event: React.KeyboardEvent, currentId: number) {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            selectNeighbor(currentId, 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            selectNeighbor(currentId, -1);
        } else if (event.key === "Home") {
            event.preventDefault();
            onSelect(projects[0].id);
            focusTab(projects[0].id);
        } else if (event.key === "End") {
            event.preventDefault();
            onSelect(projects[projects.length - 1].id);
            focusTab(projects[projects.length - 1].id);
        }
    }

    return (
        <div className="lg:sticky lg:top-8">
            <p className="mb-3 hidden px-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft) lg:block">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>

            <div
                role="tablist"
                aria-label="Projects"
                className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[75dvh] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0"
            >
                {projects.map((project) => {
                    const selected = project.id === selectedId;

                    return (
                        <button
                            key={project.id}
                            ref={(element) => {
                                if (element) {
                                    tabRefs.current.set(project.id, element);
                                } else {
                                    tabRefs.current.delete(project.id);
                                }
                            }}
                            type="button"
                            role="tab"
                            id={projectTabId(project.id)}
                            aria-selected={selected}
                            aria-controls={projectPanelId(project.id)}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => onSelect(project.id)}
                            onKeyDown={(event) => handleKeyDown(event, project.id)}
                            className={`
                                w-64
                                shrink-0
                                rounded-2xl
                                border
                                p-4
                                text-left
                                transition-colors
                                duration-150
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-(--accent-strong)
                                sm:w-72
                                lg:w-full
                                ${
                                    selected
                                        ? "border-(--glass-border) bg-(--glass-bg) shadow-[inset_0_1px_0_var(--glass-highlight)]"
                                        : "border-transparent hover:border-(--glass-border) hover:bg-(--glass-bg)"
                                }
                            `}
                        >
                            <StatusBadge project={project} />

                            <span className="mt-2.5 block font-display text-[17px] font-medium leading-snug text-(--ink)">
                                <span className="line-clamp-2">{project.title}</span>
                            </span>

                            {project.category !== "" && (
                                <span className="mt-1 block truncate font-mono text-[11px] text-(--graphite-soft)">
                                    {project.category}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
