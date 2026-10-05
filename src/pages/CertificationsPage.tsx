import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import {
    CertificationShowcase,
} from "@/components/certifications";
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
                compact
            />

            <Section id="credentials">
                <Container>
                    {isPending ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            Loading certifications...
                        </p>
                    ) : certifications.length === 0 ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            No certifications yet.
                        </p>
                    ) : (
                        <CertificationShowcase certifications={certifications} />
                    )}
                </Container>
            </Section>

            <Footer />
        </>
    );
}