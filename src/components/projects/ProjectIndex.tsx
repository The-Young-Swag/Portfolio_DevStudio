import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Project } from "@/services/projects/projects";
import { MediaFrame } from "@/components/ui";
import { projectPanelId, projectTabId } from "./projectStatus";

type ProjectIndexProps = {
    projects: Project[];
    selectedId: number | null;
    onSelect: (id: number) => void;
};

function prefersReducedMotion(): boolean {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Cardless project index. Tiles render once per project list; selecting
 * one only flips state and attributes so the scroller never loses its
 * position. Thumbnails show whole on their tone stage, never cropped.
 */
export function ProjectIndex({ projects, selectedId, onSelect }: ProjectIndexProps) {
    const tabRefs = useRef(new Map<number, HTMLButtonElement>());
    const railRef = useRef<HTMLDivElement>(null);
    const [canScroll, setCanScroll] = useState(false);

    useEffect(() => {
        const rail = railRef.current;

        if (!rail) {
            return;
        }

        const update = () => {
            setCanScroll(rail.scrollWidth > rail.clientWidth + 2);
        };

        update();
        window.addEventListener("resize", update);

        return () => {
            window.removeEventListener("resize", update);
        };
    }, [projects.length]);

    useEffect(() => {
        for (const [id, tab] of tabRefs.current) {
            const selected = id === selectedId;
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
            tab.dataset.active = String(selected);
        }
    }, [selectedId]);

    function focusTab(id: number) {
        tabRefs.current.get(id)?.focus();
    }

    function reveal(id: number) {
        tabRefs.current.get(id)?.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            inline: "nearest",
            block: "nearest",
        });
    }

    function select(id: number, focus: boolean) {
        onSelect(id);

        if (focus) {
            focusTab(id);
        }

        reveal(id);
    }

    function selectNeighbor(currentId: number, direction: 1 | -1) {
        const index = projects.findIndex((project) => project.id === currentId);

        if (index === -1 || projects.length === 0) {
            return;
        }

        const next = projects[(index + direction + projects.length) % projects.length];
        select(next.id, true);
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
            select(projects[0].id, true);
        } else if (event.key === "End") {
            event.preventDefault();
            select(projects[projects.length - 1].id, true);
        }
    }

    function scrollRail(direction: 1 | -1) {
        const rail = railRef.current;

        if (!rail) {
            return;
        }

        rail.scrollBy({
            left: direction * rail.clientWidth * 0.8,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    }

    return (
        <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                    {projects.length} {projects.length === 1 ? "project" : "projects"}
                </p>

                {canScroll && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => scrollRail(-1)}
                            aria-label="Previous projects"
                            className="
                                surface-tint
                                inline-flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                text-(--accent-deep)
                                transition-[filter]
                                duration-150
                                hover:brightness-95
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-(--accent-strong)
                            "
                        >
                            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollRail(1)}
                            aria-label="Next projects"
                            className="
                                surface-tint
                                inline-flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                text-(--accent-deep)
                                transition-[filter]
                                duration-150
                                hover:brightness-95
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-(--accent-strong)
                            "
                        >
                            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={railRef}
                role="tablist"
                aria-label="Projects"
                className="
                    -m-2
                    grid
                    snap-x
                    snap-proximity
                    grid-flow-col
                    auto-cols-[minmax(13rem,1fr)]
                    gap-7
                    overflow-x-auto
                    p-2
                    pb-4
                "
            >
                {projects.map((project) => {
                    const meta = [project.category, project.year !== 0 ? String(project.year) : ""]
                        .filter((part) => part !== "")
                        .join(" · ");

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
                            aria-selected={project.id === selectedId}
                            aria-controls={projectPanelId(project.id)}
                            tabIndex={project.id === selectedId ? 0 : -1}
                            data-active={project.id === selectedId}
                            onClick={() => select(project.id, false)}
                            onKeyDown={(event) => handleKeyDown(event, project.id)}
                            className="
                                rail-item
                                group
                                flex
                                h-full
                                min-w-0
                                snap-start
                                flex-col
                                gap-3.5
                                text-left
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-(--accent-strong)
                            "
                        >
                            <MediaFrame
                                src={project.thumbnail}
                                alt={`${project.title} preview`}
                                ratio="16/10"
                                fit="cover-top"
                                name={project.title}
                                label={project.category}
                            />

                            <span className="flex min-w-0 flex-1 flex-col px-1">
                                <span className="rail-title tile-title block break-words font-display text-[18px] font-medium leading-[1.3]">
                                    {project.title}
                                </span>

                                {meta !== "" && (
                                    <span className="mb-1 mt-auto block truncate pt-2 text-[12.5px] text-(--graphite)">
                                        {meta}
                                    </span>
                                )}
                            </span>

                            <span aria-hidden="true" className="rail-bar" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
