import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { ProjectDetails, ProjectsGrid } from "@/components/projects";
import { SectionHeading } from "@/components/ui";

export function ProjectsPage() {
    return (
        <>
            <PageHeader
                index="02"
                title="Projects"
                eyebrow="things I've built"
                description="A selection of systems I designed and shipped — from real-time attendance tooling to an AI learning platform. Each one taught me something about shipping software that other people actually use."
            />

            <Section id="showcase">
                <Container>
                    <SectionHeading number="01" title="Showcase" />

                    <ProjectsGrid />
                </Container>
            </Section>

            <Section id="details">
                <Container>
                    <SectionHeading number="02" title="Details" />

                    <ProjectDetails />
                </Container>
            </Section>

            <Footer />
        </>
    );
}