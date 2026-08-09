import { ChevronLeft, ChevronRight } from "lucide-react";

import { certifications } from "@/constants/certifications";
import { CertificationItem } from "./CertificationItem";

export function CertificationList() {
    return (
        <div className="mt-4">
            <div className="relative">
                {/* Previous */}
                <button
                    type="button"
                    aria-label="Previous certifications"
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
                        border-neutral-200
                        bg-white
                        text-neutral-500
                        transition-colors
                        duration-150
                        hover:border-[#059669]
                        hover:text-[#059669]
                        sm:flex
                    "
                >
                    <ChevronLeft size={15} />
                </button>

                {/* Track */}
                <div
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
                        border-neutral-200
                        bg-white
                        text-neutral-500
                        transition-colors
                        duration-150
                        hover:border-[#059669]
                        hover:text-[#059669]
                        sm:flex
                    "
                >
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}