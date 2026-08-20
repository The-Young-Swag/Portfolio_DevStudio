import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { CertificationList } from "./CertificationList";

export function CertificationsSection() {
    return (
        <Section id="certification">
            <Container>
                <SectionHeading number="05" title="Certifications" />

                <p className="mt-3 max-w-lg font-mono text-[12px] leading-relaxed text-(--graphite)">
                    Credentials earned along the way — proof that I finish
                    what I start.
                </p>

                <CertificationList />
            </Container>
        </Section>
    );
}