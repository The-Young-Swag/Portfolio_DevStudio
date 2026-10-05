import { ContentImage } from "@/components/ui";
import type { Certification } from "@/services/certifications/certifications";
import { VerificationBadge } from "./VerificationBadge";

const ACCENT_TONES: Record<Certification["accent"], string> = {
    blue: "from-[#1b2b44] to-[#3f6aa3]",
    purple: "from-[#2a2438] to-[#6a54a0]",
    viridian: "from-[#1c3a2c] to-[#4d7a52]",
};

// Paper-certificate miniature used wherever a real scan is missing. Purely
// decorative: the lines carry no information.
function CertificateSheet({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={`
                flex
                w-[58%]
                flex-col
                items-center
                justify-center
                gap-[7px]
                overflow-hidden
                rounded-[6px]
                bg-[#fbfaf6]
                p-3
                shadow-[0_8px_24px_-10px_rgba(0,0,0,0.5)]
                ring-1
                ring-[#cfc9b3]
                ring-inset
                ${className ?? ""}
            `}
        >
            <span className="h-[3px] w-[46%] rounded-full bg-[#d8d3c0]" />
            <span className="h-[3px] w-[28%] rounded-full bg-[#d8d3c0]" />
            <span className="h-[3px] w-[60%] rounded-full bg-[#d8d3c0]" />
        </span>
    );
}

type CertificationCoverProps = {
    certification: Pick<Certification, "accent" | "image" | "link" | "name">;
};

export function CertificationCover({ certification }: CertificationCoverProps) {
    return (
        <span
            className={`
                relative
                flex
                aspect-[16/10]
                items-center
                justify-center
                bg-linear-to-br
                ${ACCENT_TONES[certification.accent] ?? ACCENT_TONES.blue}
            `}
        >
            {certification.image !== "" ? (
                <ContentImage
                    src={certification.image}
                    alt=""
                    imageClassName="absolute inset-0 h-full w-full object-cover"
                    placeholderClassName="absolute inset-0 h-full w-full"
                />
            ) : (
                <CertificateSheet />
            )}

            <span className="absolute left-2.5 top-2.5">
                <VerificationBadge certification={certification} onCover />
            </span>
        </span>
    );
}
