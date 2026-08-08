import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { StackGrid } from "./StackGrid";

export function StackSection() {
    return (
        <Section id="stack">
            <Container>
                <SectionHeading
                    number="04"
                    title="Stack"
                />

                <StackGrid />
            </Container>
        </Section>
    );
}