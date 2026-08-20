import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { certifications } from "@/constants/certifications";
import { CertificationItem } from "./CertificationItem";

export function CertificationList() {
    const trackRef = useRef<HTMLDivElement>(null);

    const scrollTrack = (direction: 1 | -1) => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        track.scrollBy({
            left: direction * track.clientWidth * 0.8,
            behavior: "smooth",
        });
    };

    return (
        <div className="mt-4">
            <div className="relative">
                {/* Previous */}
                <button
                    type="button"
                    aria-label="Previous certifications"
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
                        shadow-[inset_0_1px_0_var(--glass-highlight)]
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
                        gap-3
                        overflow-x-auto
                        px-1
                        pb-2
                        scrollbar-none
                    "
                >
                    {certifications.map((certification) => (
                        <CertificationItem
                            key={`${certification.issuer}-${certification.name}`}
                            {...certification}
                        />
                    ))}
                </div>

                {/* Next */}
                <button
                    type="button"
                    aria-label="Next certifications"
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
                        shadow-[inset_0_1px_0_var(--glass-highlight)]
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
        </div>
    );
}