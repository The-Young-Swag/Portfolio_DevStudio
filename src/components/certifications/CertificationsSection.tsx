import { useState } from "react";
import { Link } from "react-router";

import { Carousel } from "@/components/carousel";
import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { useCertifications } from "@/hooks/certifications/useCertifications";
import type { Certification } from "@/services/certifications/certifications";

import { CertificationItem } from "./CertificationItem";
import { PdfLightbox } from "./PdfLightbox";

export function CertificationsSection() {
    const { certifications, isPending } = useCertifications();
    const [preview, setPreview] = useState<Certification | null>(null);

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
                ) : certifications.length === 0 ? (
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
                        {certifications.map((certification) => (
                            <div key={certification.id} className="carousel-card">
                                <CertificationItem
                                    {...certification}
                                    onPreview={
                                        certification.image === "" &&
                                        certification.pdf !== ""
                                            ? () => setPreview(certification)
                                            : undefined
                                    }
                                />
                            </div>
                        ))}
                    </Carousel>
                )}

                {preview !== null && (
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