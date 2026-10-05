import { useState } from "react";

import type { CaseScreenshot } from "@/services/projects/projects";
import { ContentImage } from "@/components/ui";

type ProjectGalleryProps = {
    title: string;
    shots: CaseScreenshot[];
};

export function ProjectGallery({ title, shots }: ProjectGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

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
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-(--line)">
                <ContentImage
                    key={active.url}
                    src={active.url}
                    alt={caption}
                    imageClassName="h-full w-full object-cover"
                    placeholderClassName="h-full w-full"
                />
            </div>

            {caption !== "" && (
                <p className="mt-2 font-mono text-[11px] text-(--graphite-soft)">
                    {caption}
                </p>
            )}

            {shots.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
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
                                    w-28
                                    shrink-0
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
        </section>
    );
}
