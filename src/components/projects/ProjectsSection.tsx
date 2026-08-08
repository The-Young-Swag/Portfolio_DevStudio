import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { ProjectsGrid } from "./ProjectsGrid";

export function ProjectsSection() {
    return (
        <Section id="projects">
            <Container>
                <SectionHeading
                    number="02"
                    title="Projects"
                />

                <ProjectsGrid />
            </Container>
        </Section>
    );
}