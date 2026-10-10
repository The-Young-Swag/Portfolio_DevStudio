import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import type { Project } from "@/services/projects/projects";
import { ContentImage, safeHttpUrl } from "@/components/ui";
import { StatusBadge } from "./StatusBadge";
import { projectPanelId, projectTabId } from "./projectStatus";

// Cover tones cycle deterministically by project id so every card gets a
// distinct backdrop without storing presentation in the data.
const COVER_TONES = [
    "from-[#1c3a2c] to-[#4d7a52]",
    "from-[#1b2b44] to-[#3f6aa3]",
    "from-[#2a2438] to-[#6a54a0]",
    "from-[#33291c] to-[#8a6c3a]",
];

function toneFor(id: number) {
    return COVER_TONES[((id % COVER_TONES.length) + COVER_TONES.length) % COVER_TONES.length];
}

type ProjectIndexProps = {
    projects: Project[];
    selectedId: number | null;
    onSelect: (id: number) => void;
};

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

    function scrollRail(direction: 1 | -1) {
        const rail = railRef.current;

        if (!rail) {
            return;
        }

        rail.scrollBy({
            left: direction * rail.clientWidth * 0.8,
            behavior:
                window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
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
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-(--glass-border)
                                bg-(--glass-bg)
                                text-(--graphite)
                                transition-colors
                                duration-150
                                hover:border-(--accent-strong)
                                hover:text-(--ink)
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
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-(--glass-border)
                                bg-(--glass-bg)
                                text-(--graphite)
                                transition-colors
                                duration-150
                                hover:border-(--accent-strong)
                                hover:text-(--ink)
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
                    grid
                    snap-x
                    snap-proximity
                    grid-flow-col
                    auto-cols-[minmax(15rem,1fr)]
                    gap-4
                    overflow-x-auto
                    px-2
                    pb-6
                    pt-3
                    -mx-2
                    -mt-3
                    -mb-6
                "
            >
                {projects.map((project) => {
                    const selected = project.id === selectedId;
                    const safeThumbnail = safeHttpUrl(project.thumbnail);

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
                                flex
                                min-w-0
                                snap-start
                                flex-col
                                overflow-hidden
                                rounded-[1.375rem]
                                border
                                bg-(--glass-bg)
                                text-left
                                backdrop-blur-xl
                                backdrop-saturate-160
                                transition-[transform,border-color]
                                duration-200
                                hover:-translate-y-0.5
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-(--accent-strong)
                                ${
                                    selected
                                        ? "border-(--accent-strong) shadow-[0_0_0_1px_var(--accent-strong)]"
                                        : "border-(--glass-border)"
                                }
                            `}
                        >
                            <span
                                className={`
                                    relative
                                    flex
                                    aspect-[16/10]
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    bg-linear-to-br
                                    p-3
                                    ${toneFor(project.id)}
                                `}
                            >
                                {safeThumbnail !== "" ? (
                                    <ContentImage
                                        src={safeThumbnail}
                                        alt=""
                                        imageClassName="h-auto max-h-full w-auto max-w-full rounded-[2px]"
                                        placeholderClassName="absolute inset-0 h-full w-full"
                                    />
                                ) : (
                                    <ImageOff
                                        size={20}
                                        strokeWidth={1.5}
                                        aria-hidden="true"
                                        className="text-white/70"
                                    />
                                )}

                                <span className="absolute left-2.5 top-2.5">
                                    <StatusBadge project={project} />
                                </span>
                            </span>

                            <span className="flex min-w-0 flex-col gap-1.5 p-4 pb-5">
                                <span
                                    className={`
                                        line-clamp-2
                                        break-words
                                        font-display
                                        text-[19px]
                                        font-medium
                                        leading-[1.25]
                                        ${selected ? "text-(--accent-strong)" : "text-(--ink)"}
                                    `}
                                >
                                    {project.title}
                                </span>

                                {project.category !== "" && (
                                    <span className="truncate text-[12.5px] text-(--graphite)">
                                        {project.category}
                                    </span>
                                )}

                                {project.stack.length > 0 && (
                                    <span className="mt-0.5 flex flex-wrap gap-1.5">
                                        {project.stack.slice(0, 3).map((technology) => (
                                            <span
                                                key={technology}
                                                className="
                                                    whitespace-nowrap
                                                    rounded-full
                                                    border
                                                    border-(--glass-border)
                                                    bg-(--glass-bg)
                                                    px-2.5
                                                    py-1
                                                    font-mono
                                                    text-[11px]
                                                    text-(--graphite)
                                                "
                                            >
                                                {technology}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
