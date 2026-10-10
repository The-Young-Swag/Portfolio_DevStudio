import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Certification } from "@/services/certifications/certifications";
import { CertImage } from "./CertImage";
import { safeHttpUrl } from "./certificationUrls";
import { certPanelId, certTabId } from "./certificationIds";

type CertificationRailProps = {
    certifications: Certification[];
    selectedId: number | null;
    onSelect: (id: number) => void;
};

function prefersReducedMotion(): boolean {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Cardless certificate index. The rail renders once per certificate
 * list; selecting an item only flips state and attributes so the
 * scroller never loses its position.
 */
export function CertificationRail({ certifications, selectedId, onSelect }: CertificationRailProps) {
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
        const index = certifications.findIndex(
            (certification) => certification.id === currentId,
        );

        if (index === -1 || certifications.length === 0) {
            return;
        }

        const next =
            certifications[(index + direction + certifications.length) % certifications.length];
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
            select(certifications[0].id, true);
        } else if (event.key === "End") {
            event.preventDefault();
            select(certifications[certifications.length - 1].id, true);
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
                            aria-label="Next certifications"
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
                aria-label="Certifications"
                className="
                    cert-rail
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
                {certifications.map((certification) => (
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
                        aria-selected={certification.id === selectedId}
                        aria-controls={certPanelId(certification.id)}
                        tabIndex={certification.id === selectedId ? 0 : -1}
                        data-active={certification.id === selectedId}
                        onClick={() => select(certification.id, false)}
                        onKeyDown={(event) => handleKeyDown(event, certification.id)}
                        className="
                            cert-rail-item
                            flex
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
                        <span className="surface-stage cert-rail-stage flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl p-4 [--cert-max-h:8rem]">
                            <CertImage
                                src={safeHttpUrl(certification.image)}
                                alt={`${certification.name} certificate`}
                                imageClassName="rounded-[3px]"
                            />
                        </span>

                        <span className="min-w-0">
                            <span className="cert-rail-title line-clamp-2 block break-words font-display text-[18px] font-medium leading-[1.3]">
                                {certification.name}
                            </span>

                            {(certification.issuer !== "" || certification.year !== "") && (
                                <span className="mt-1 block truncate text-[12.5px] text-(--graphite)">
                                    {[certification.issuer, certification.year]
                                        .filter((part) => part !== "")
                                        .join(" · ")}
                                </span>
                            )}
                        </span>

                        <span aria-hidden="true" className="cert-rail-bar" />
                    </button>
                ))}
            </div>
        </div>
    );
}
