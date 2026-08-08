import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { ExperienceList } from "./ExperienceList";

export function ExperienceSection() {
    return (
        <Section id="experience">
            <Container>
                <SectionHeading
                    number="03"
                    title="Experience"
                />

                <ExperienceList />
            </Container>
        </Section>
    );
}