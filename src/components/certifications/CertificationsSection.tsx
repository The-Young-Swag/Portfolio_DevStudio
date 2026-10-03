import { Link } from "react-router";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { useCertifications } from "@/hooks/certifications/useCertifications";

import { CertificationList } from "./CertificationList";

export function CertificationsSection() {
    const { certifications, isPending } = useCertifications();

    return (
        <Section id="certification">
            <Container>
                <SectionHeading number="05" title="Certifications" />

                <p className="mt-3 max-w-lg font-mono text-[12px] leading-relaxed text-(--graphite)">
                    Credentials earned along the way — proof that I finish
                    what I start.
                </p>

                {isPending ? (
                    <p className="mt-4 font-mono text-[10.5px] text-(--graphite)">
                        Loading certifications...
                    </p>
                ) : certifications.length === 0 ? (
                    <p className="mt-4 font-mono text-[10.5px] text-(--graphite)">
                        No certifications yet.
                    </p>
                ) : (
                    <CertificationList certifications={certifications} />
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