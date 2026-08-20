import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { projects } from "@/constants/projects";

export function ProjectCarousel() {
    const trackRef = useRef<HTMLDivElement>(null);

    const scrollTrack = (direction: 1 | -1) => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const card = track.querySelector<HTMLElement>("[data-project-card]");

        const step = card
            ? card.getBoundingClientRect().width + 20
            : track.clientWidth * 0.8;

        track.scrollBy({
            left: direction * step,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative">
            {/* Previous */}
            <button
                type="button"
                aria-label="Previous projects"
                onClick={() => scrollTrack(-1)}
                className="
                    absolute
                    -left-3
                    top-1/2
                    z-10
                    hidden
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    text-(--graphite)
                    shadow-[inset_0_1px_0_var(--glass-highlight),0_6px_16px_rgba(31,38,135,0.08)]
                    backdrop-blur-md
                    transition-colors
                    duration-150
                    hover:border-(--accent-strong)
                    hover:text-(--accent-strong)
                    sm:flex
                "
            >
                <ChevronLeft size={15} />
            </button>

            {/* Track */}
            <div
                ref={trackRef}
                className="
                    flex
                    gap-5
                    overflow-x-auto
                    pb-2
                    scrollbar-none
                    snap-x
                    snap-mandatory
                "
            >
                {projects.map((project) => (
                    <article
                        key={project.title}
                        data-project-card
                        className="
                            group
                            glass
                            relative
                            w-[min(290px,85vw)]
                            shrink-0
                            snap-start
                            overflow-hidden
                            rounded-2xl

                            transition-[background-color,box-shadow]
                            duration-500
                            ease-[cubic-bezier(0.22,1,0.36,1)]

                            hover:bg-(--glass-bg-strong)
                            hover:shadow-[inset_0_1px_0_var(--glass-highlight),0_0_0_1px_var(--accent-strong)/20,0_16px_40px_-20px_var(--accent-strong)/35]
                        "
                    >
                        <div className="relative aspect-video overflow-hidden border-b border-(--line)">
                            <img
                                src={project.thumbnail}
                                alt={`${project.title} preview`}
                                loading="lazy"
                                decoding="async"
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-700
                                    ease-[cubic-bezier(0.22,1,0.36,1)]
                                    group-hover:scale-[1.04]
                                "
                            />
                        </div>

                        <div className="p-4">
                            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-(--graphite)">
                                <span>{project.year}</span>
                                <span aria-hidden="true" className="opacity-40">·</span>
                                <span>{project.category}</span>
                            </div>

                            <h3 className="mt-2.5 font-display text-[20px] leading-tight text-(--ink)">
                                {project.title}
                            </h3>

                            <p className="mt-1.5 text-[12.5px] leading-5 text-(--graphite)">
                                {project.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {project.stack.map((technology) => (
                                    <span
                                        key={technology}
                                        className="
                                            rounded-full
                                            border
                                            border-(--accent-strong)/50
                                            px-2.5
                                            py-1
                                            font-mono
                                            text-[9.5px]
                                            text-(--graphite)
                                            transition-colors
                                            duration-500
                                            group-hover:border-(--accent-strong)
                                            group-hover:text-(--ink)
                                        "
                                    >
                                        {technology}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Next */}
            <button
                type="button"
                aria-label="Next projects"
                onClick={() => scrollTrack(1)}
                className="
                    absolute
                    -right-3
                    top-1/2
                    z-10
                    hidden
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-(--glass-border)
                    bg-(--glass-bg)
                    text-(--graphite)
                    shadow-[inset_0_1px_0_var(--glass-highlight),0_6px_16px_rgba(31,38,135,0.08)]
                    backdrop-blur-md
                    transition-colors
                    duration-150
                    hover:border-(--accent-strong)
                    hover:text-(--accent-strong)
                    sm:flex
                "
            >
                <ChevronRight size={15} />
            </button>
        </div>
    );
}