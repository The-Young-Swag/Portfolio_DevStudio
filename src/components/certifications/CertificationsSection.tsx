import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { CertificationList } from "./CertificationList";

export function CertificationsSection() {
    return (
        <Section id="certification">
            <Container>
                <SectionHeading
                    number="05"
                    title="Certifications"
                />

                <CertificationList />
            </Container>
        </Section>
    );
}