import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselProps = {
    label: string;
    heading: ReactNode;
    previousLabel: string;
    nextLabel: string;
    gap?: string;
    children: ReactNode;
};

const navButtonClassName = `
    flex
    h-8
    w-8
    items-center
    justify-center
    rounded-full
    border
    border-(--glass-border)
    bg-(--glass-bg)
    text-(--graphite)
    shadow-[inset_0_1px_0_var(--glass-highlight)]
    transition-colors
    duration-150
    hover:border-(--accent-strong)
    hover:text-(--accent-strong)
    disabled:opacity-40
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-(--accent-strong)
`;

export function Carousel({
    label,
    heading,
    previousLabel,
    nextLabel,
    gap = "1rem",
    children,
}: CarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number | null>(null);

    const [canScrollPrevious, setCanScrollPrevious] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    function updateEnds() {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        setCanScrollPrevious(track.scrollLeft > 1);
        setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
    }

    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        updateEnds();

        const scheduleUpdate = () => {
            if (frameRef.current !== null) {
                return;
            }

            frameRef.current = window.requestAnimationFrame(() => {
                frameRef.current = null;
                updateEnds();
            });
        };

        track.addEventListener("scroll", scheduleUpdate, { passive: true });

        const observer = new ResizeObserver(scheduleUpdate);
        observer.observe(track);

        return () => {
            track.removeEventListener("scroll", scheduleUpdate);
            observer.disconnect();

            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    function stepWidth(): number {
        const track = trackRef.current;

        if (!track) {
            return 0;
        }

        const first = track.querySelector(":scope > *");
        const second = first?.nextElementSibling;

        if (first instanceof HTMLElement && second instanceof HTMLElement) {
            return second.offsetLeft - first.offsetLeft;
        }

        return track.clientWidth * 0.8;
    }

    function scrollByStep(direction: 1 | -1) {
        trackRef.current?.scrollBy({ left: direction * stepWidth(), behavior: "auto" });
    }

    const showNav = canScrollPrevious || canScrollNext;

    return (
        <div role="region" aria-roledescription="carousel" aria-label={label}>
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">{heading}</div>

                {showNav && (
                    <div className="carousel-nav flex shrink-0 gap-2">
                        <button
                            type="button"
                            aria-label={previousLabel}
                            disabled={!canScrollPrevious}
                            onClick={() => scrollByStep(-1)}
                            className={navButtonClassName}
                        >
                            <ChevronLeft size={15} />
                        </button>

                        <button
                            type="button"
                            aria-label={nextLabel}
                            disabled={!canScrollNext}
                            onClick={() => scrollByStep(1)}
                            className={navButtonClassName}
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={trackRef}
                tabIndex={0}
                role="group"
                aria-label={`${label} items`}
                className="carousel-track mt-5"
                style={{ "--carousel-gap": gap } as CSSProperties}
            >
                {children}
            </div>
        </div>
    );
}
