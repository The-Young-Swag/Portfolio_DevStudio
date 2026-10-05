import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Certification } from "@/services/certifications/certifications";
import { CertificationCover } from "./CertificationCover";
import { certPanelId, certTabId } from "./certificationIds";

type CertificationRailProps = {
    certifications: Certification[];
    selectedId: number | null;
    onSelect: (id: number) => void;
};

export function CertificationRail({
    certifications,
    selectedId,
    onSelect,
}: CertificationRailProps) {
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
    }, [certifications.length]);

    function focusTab(id: number) {
        tabRefs.current.get(id)?.focus();
    }

    function selectNeighbor(currentId: number, direction: 1 | -1) {
        const index = certifications.findIndex(
            (certification) => certification.id === currentId,
        );

        if (index === -1 || certifications.length === 0) {
            return;
        }

        const next =
            certifications[
                (index + direction + certifications.length) % certifications.length
            ];
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
            onSelect(certifications[0].id);
            focusTab(certifications[0].id);
        } else if (event.key === "End") {
            event.preventDefault();
            onSelect(certifications[certifications.length - 1].id);
            focusTab(certifications[certifications.length - 1].id);
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
                    {certifications.length}{" "}
                    {certifications.length === 1 ? "certification" : "certifications"}
                </p>

                {canScroll && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => scrollRail(-1)}
                            aria-label="Previous certifications"
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
                            aria-label="Next certifications"
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
                aria-label="Certifications"
                className="
                    grid
                    snap-x
                    snap-proximity
                    grid-flow-col
                    auto-cols-[minmax(15rem,1fr)]
                    gap-4
                    -mx-2
                    -mb-6
                    -mt-3
                    overflow-x-auto
                    px-2
                    pb-6
                    pt-3
                "
            >
                {certifications.map((certification) => {
                    const selected = certification.id === selectedId;

                    return (
                        <button
                            key={certification.id}
                            ref={(element) => {
                                if (element) {
                                    tabRefs.current.set(certification.id, element);
                                } else {
                                    tabRefs.current.delete(certification.id);
                                }
                            }}
                            type="button"
                            role="tab"
                            id={certTabId(certification.id)}
                            aria-selected={selected}
                            aria-controls={certPanelId(certification.id)}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => onSelect(certification.id)}
                            onKeyDown={(event) => handleKeyDown(event, certification.id)}
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
                            <CertificationCover certification={certification} />

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
                                    {certification.name}
                                </span>

                                {certification.issuer !== "" && (
                                    <span className="truncate text-[12.5px] text-(--graphite)">
                                        {certification.issuer}
                                    </span>
                                )}

                                {(certification.credential !== "" ||
                                    certification.year !== "") && (
                                    <span className="mt-0.5 flex flex-wrap gap-1.5">
                                        {certification.credential !== "" && (
                                            <span className="whitespace-nowrap rounded-full border border-(--glass-border) bg-(--glass-bg) px-2.5 py-1 font-mono text-[11px] text-(--graphite)">
                                                {certification.credential}
                                            </span>
                                        )}

                                        {certification.year !== "" && (
                                            <span className="whitespace-nowrap rounded-full border border-(--glass-border) bg-(--glass-bg) px-2.5 py-1 font-mono text-[11px] text-(--graphite)">
                                                {certification.year}
                                            </span>
                                        )}
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
