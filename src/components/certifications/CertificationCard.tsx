import { useState } from "react";

import type { Certification } from "@/services/certifications/certifications";
import { ImageLightbox } from "@/components/ui";
import { CertificationItem } from "./CertificationItem";

type CertificationCardProps = {
    certification: Certification;
};

const actionClassName =
    "font-mono text-[11px] text-(--accent-strong) hover:underline";

export function CertificationCard({ certification }: CertificationCardProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const hasPdf = certification.pdf !== "";
    const hasImage = certification.image !== "";
    const hasVerify = certification.link !== "";

    return (
        <>
            <CertificationItem
                {...certification}
                className="w-full"
                actions={
                    <>
                        {hasPdf && (
                            <>
                                <a
                                    href={certification.pdf}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={actionClassName}
                                >
                                    View certificate ↗
                                </a>
                                <a
                                    href={certification.pdf}
                                    download
                                    className={actionClassName}
                                >
                                    Download
                                </a>
                            </>
                        )}

                        {!hasPdf && hasImage && (
                            <button
                                type="button"
                                onClick={() => setLightboxOpen(true)}
                                className={actionClassName}
                            >
                                View certificate
                            </button>
                        )}

                        {hasVerify && (
                            <a
                                href={certification.link}
                                target="_blank"
                                rel="noreferrer"
                                className={actionClassName}
                            >
                                Verify ↗
                            </a>
                        )}
                    </>
                }
            />

            {lightboxOpen && hasImage && (
                <ImageLightbox
                    src={certification.image}
                    alt={`${certification.name} certificate`}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
}
