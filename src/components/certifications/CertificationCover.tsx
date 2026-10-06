import { ContentImage, ImagePlaceholder } from "@/components/ui";
import type { Certification } from "@/services/certifications/certifications";
import { VerificationBadge } from "./VerificationBadge";

const ACCENT_TONES: Record<Certification["accent"], string> = {
    blue: "from-[#1b2b44] to-[#3f6aa3]",
    purple: "from-[#2a2438] to-[#6a54a0]",
    viridian: "from-[#1c3a2c] to-[#4d7a52]",
};

type CertificationCoverProps = {
    certification: Pick<Certification, "accent" | "image" | "link" | "name">;
};

/**
 * Certificate thumbnail: the real uploaded image when present,
 * otherwise the conventional neutral placeholder. Never a drawn
 * imitation of a certificate.
 */
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
                <ImagePlaceholder className="absolute inset-0 h-full w-full" />
            )}

            <span className="absolute left-2.5 top-2.5">
                <VerificationBadge certification={certification} onCover />
            </span>
        </span>
    );
}
