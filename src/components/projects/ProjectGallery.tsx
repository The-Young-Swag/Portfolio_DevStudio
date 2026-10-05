import { useState } from "react";

import type { CaseScreenshot } from "@/services/projects/projects";
import { ContentImage, ImageLightbox } from "@/components/ui";

type ProjectGalleryProps = {
    title: string;
    shots: CaseScreenshot[];
};

export function ProjectGallery({ title, shots }: ProjectGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    if (shots.length === 0) {
        return null;
    }

    const active = shots[Math.min(activeIndex, shots.length - 1)];
    const caption = active.caption === "" ? `${title} screenshot` : active.caption;

    function select(index: number, element: HTMLButtonElement | null) {
        setActiveIndex(index);
        element?.scrollIntoView({
            behavior:
                window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
            inline: "nearest",
            block: "nearest",
        });
    }

    return (
        <section aria-label="Screenshots">
            <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label={`Enlarge screenshot: ${caption}`}
                className="
                    relative
                    block
                    max-h-[min(60vh,32rem)]
                    w-full
                    overflow-hidden
                    rounded-[1.125rem]
                    border
                    border-(--line)
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-(--accent-strong)
                "
            >
                <ContentImage
                    key={active.url}
                    src={active.url}
                    alt={caption}
                    imageClassName="aspect-[2/1] h-full w-full object-cover"
                    placeholderClassName="aspect-[2/1] w-full"
                />

                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 flex h-[1.875rem] items-center gap-1.5 bg-black/25 px-3.5"
                >
                    <span className="h-2 w-2 rounded-full bg-white/35" />
                    <span className="h-2 w-2 rounded-full bg-white/35" />
                    <span className="h-2 w-2 rounded-full bg-white/35" />
                </span>
            </button>

            {caption !== "" && (
                <p className="mt-2 font-mono text-[11px] text-(--graphite-soft)">
                    {caption}
                </p>
            )}
            {shots.length > 1 && (
                <div className="mt-3 grid snap-x snap-proximity grid-flow-col auto-cols-[minmax(6rem,9.375rem)] gap-3 overflow-x-auto p-1.5 -m-1.5">
                    {shots.map((shot, index) => {
                        const label =
                            shot.caption === ""
                                ? `Screenshot ${index + 1}`
                                : shot.caption;
                        const current = index === Math.min(activeIndex, shots.length - 1);

                        return (
                                <button
                                    key={`${shot.url}-${index}`}
                                type="button"
                                aria-label={label}
                                aria-current={current}
                                onClick={(event) => select(index, event.currentTarget)}
                                className={`
                                    min-w-0
                                    snap-start
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    transition-colors
                                    duration-150
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-(--accent-strong)
                                    ${
                                        current
                                            ? "border-(--accent-strong)"
                                            : "border-(--line) hover:border-(--accent-strong)/60"
                                    }
                                `}
                            >
                                <ContentImage
                                    src={shot.url}
                                    alt=""
                                    imageClassName="aspect-video h-full w-full object-cover"
                                    placeholderClassName="aspect-video w-full"
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {lightbox && (
                <ImageLightbox
                    src={active.url}
                    alt={caption}
                    onClose={() => setLightbox(false)}
                />
            )}
        </section>
    );
}
