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

                <div className="mt-8">
                    <a
                        href="/projects"
                        className="
                            font-mono
                            text-[11px]
                            text-neutral-500
                            transition-colors
                            hover:text-[#059669]
                        "
                    >
                        See more projects ↗
                    </a>
                </div>
            </Container>
        </Section>
    );
}