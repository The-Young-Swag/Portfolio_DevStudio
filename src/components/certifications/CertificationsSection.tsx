import { useState } from "react";
import { Link } from "react-router";

import { Carousel } from "@/components/carousel";
import { Container, Section } from "@/components/layout";
import { ImageLightbox, SectionHeading } from "@/components/ui";
import { useCertifications } from "@/hooks/certifications/useCertifications";
import {
    topLevelCertifications,
    type Certification,
} from "@/services/certifications/certifications";

import { CertificationItem, type CertBadge } from "./CertificationItem";
import { PdfLightbox } from "./PdfLightbox";

export function CertificationsSection() {
    const { certifications, isPending } = useCertifications();
    const [preview, setPreview] = useState<Certification | null>(null);
    const [badgeZoom, setBadgeZoom] = useState<{ src: string; alt: string } | null>(null);
    const listed = topLevelCertifications(certifications);

    function badgesFor(certification: Certification): CertBadge[] {
        const own =
            certification.badge_image !== ""
                ? [
                      {
                          src: certification.badge_image,
                          link: certification.badge_link,
                          alt: `${certification.issuer} badge`,
                      },
                  ]
                : [];

        const children = certifications
            .filter(
                (course) =>
                    course.parent_id === certification.id && course.badge_image !== "",
            )
            .map((course) => ({
                src: course.badge_image,
                link: course.badge_link,
                alt: `${course.name} badge`,
            }));

        return [...own, ...children];
    }

    return (
        <Section id="certification">
            <Container>
                {isPending ? (
                    <>
                        <SectionHeading number="05" title="Certifications" id="certification" />

                        <p className="mt-4 font-mono text-[10.5px] text-(--graphite)">
                            Loading certifications...
                        </p>
                    </>
                ) : listed.length === 0 ? (
                    <>
                        <SectionHeading number="05" title="Certifications" id="certification" />

                        <p className="mt-4 font-mono text-[10.5px] text-(--graphite)">
                            No certifications yet.
                        </p>
                    </>
                ) : (
                    <Carousel
                        label="Certifications"
                        heading={
                            <>
                                <SectionHeading number="05" title="Certifications" id="certification" />

                                <p className="mt-3 max-w-lg font-mono text-[12px] leading-relaxed text-(--graphite)">
                                    Credentials earned along the way — proof that I finish
                                    what I start.
                                </p>
                            </>
                        }
                        previousLabel="Previous certifications"
                        nextLabel="Next certifications"
                        gap="0.75rem"
                    >
                        {listed.map((certification) => (
                            <div key={certification.id} className="carousel-card">
                                <CertificationItem
                                    {...certification}
                                    badges={badgesFor(certification)}
                                    onPreview={
                                        certification.image !== "" ||
                                        certification.pdf !== ""
                                            ? () => setPreview(certification)
                                            : undefined
                                    }
                                    onBadgePreview={(badge) => setBadgeZoom(badge)}
                                />
                            </div>
                        ))}
                    </Carousel>
                )}

                {badgeZoom !== null && (
                    <ImageLightbox
                        src={badgeZoom.src}
                        alt={badgeZoom.alt}
                        onClose={() => setBadgeZoom(null)}
                    />
                )}

                {preview !== null && preview.image !== "" && (
                    <ImageLightbox
                        src={preview.image}
                        alt={`${preview.name} certificate`}
                        onClose={() => setPreview(null)}
                    />
                )}

                {preview !== null && preview.image === "" && preview.pdf !== "" && (
                    <PdfLightbox
                        src={preview.pdf}
                        title={preview.name}
                        onClose={() => setPreview(null)}
                    />
                )}

                <Link
                    to="/certifications"
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1.5
                        font-mono
                        text-[11.5px]
                        text-(--accent-strong)
                        transition-colors
                        duration-150
                        hover:text-(--accent-deep)
                        hover:underline
                    "
                >
                    See all certifications →
                </Link>
            </Container>
        </Section>
    );
}