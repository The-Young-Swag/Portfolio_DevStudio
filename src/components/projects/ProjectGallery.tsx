import { useState } from "react";

import type { CaseScreenshot } from "@/services/projects/projects";
import { ContentImage, ImageLightbox, safeHttpUrl } from "@/components/ui";

type ProjectGalleryProps = {
    title: string;
    shots: CaseScreenshot[];
};

export function ProjectGallery({ title, shots }: ProjectGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [deadUrl, setDeadUrl] = useState<string | null>(null);

    if (shots.length === 0) {
        return null;
    }

    const active = shots[Math.min(activeIndex, shots.length - 1)];
    const activeUrl = safeHttpUrl(active.url);
    const caption = active.caption === "" ? `${title} screenshot` : active.caption;
    const zoomable = activeUrl !== "" && deadUrl !== activeUrl;

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

    const viewer = (
        <span className="flex items-center justify-center">
            <ContentImage
                key={activeUrl}
                src={activeUrl}
                alt={caption}
                onUnavailable={() => setDeadUrl(activeUrl)}
                imageClassName="h-auto max-h-[min(60vh,32rem)] w-auto max-w-full rounded-md"
                placeholderClassName="aspect-video w-full"
            />
        </span>
    );

    return (
        <section aria-label="Screenshots">
            {zoomable ? (
                <button
                    type="button"
                    onClick={() => setLightbox(true)}
                    aria-label={`Enlarge screenshot: ${caption}`}
                    className="
                        surface-stage
                        block
                        w-full
                        cursor-zoom-in
                        rounded-[1.125rem]
                        border
                        border-(--line)
                        p-4
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-(--accent-strong)
                    "
                >
                    {viewer}
                </button>
            ) : (
                <div
                    className="
                        surface-stage
                        w-full
                        rounded-[1.125rem]
                        border
                        border-(--line)
                        p-4
                    "
                >
                    {viewer}
                </div>
            )}

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
                        const shotUrl = safeHttpUrl(shot.url);

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
                                <span className="surface-stage flex h-20 w-full items-center justify-center p-1.5">
                                    <ContentImage
                                        src={shotUrl}
                                        alt=""
                                        imageClassName="h-auto max-h-full w-auto max-w-full"
                                        placeholderClassName="h-full w-full"
                                    />
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {lightbox && zoomable && (
                <ImageLightbox
                    src={activeUrl}
                    alt={caption}
                    onClose={() => setLightbox(false)}
                />
            )}
        </section>
    );
}
