import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { ProjectsGrid } from "./ProjectsGrid";

export function ProjectsSection() {
    return (
        <Section id="projects">
            <Container>
                <SectionHeading
                    number="02"
                    title="Selected projects"
                />

                <div className="mt-5">
                    <ProjectsGrid />
                </div>

                <a
                    href="/projects"
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1.5
                        font-mono
                        text-[11.5px]
                        text-[#059669]
                        hover:underline
                    "
                >
                    See all projects →
                </a>
            </Container>
        </Section>
    );
}