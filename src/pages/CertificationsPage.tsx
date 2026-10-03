import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import {
    CertificationGrid,
} from "@/components/certifications";
import { SectionHeading } from "@/components/ui";
import { useCertifications } from "@/hooks/certifications/useCertifications";

export function CertificationsPage() {
    const { certifications, isPending } = useCertifications();

    return (
        <>
            <PageHeader
                index="05"
                title="Certifications"
                eyebrow="proof of work"
                description="Credentials earned along the way — structured programs and skill assessments that pushed me past the tutorial stage and into building."
            />

            <Section id="credentials">
                <Container>
                    <SectionHeading number="01" title="Credentials" id="credentials" />

                    {isPending ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            Loading certifications...
                        </p>
                    ) : certifications.length === 0 ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            No certifications yet.
                        </p>
                    ) : (
                        <CertificationGrid certifications={certifications} />
                    )}
                </Container>
            </Section>

            <Footer />
        </>
    );
}