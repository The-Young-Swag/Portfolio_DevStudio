import { Link } from "react-router";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { ProjectCarousel } from "./ProjectCarousel";


export function ProjectsSection() {
    return (
        <Section id="projects">
            <Container>
                <SectionHeading
                    number="02"
                    title="Selected projects"
                />

                <div className="mt-5">
                    <ProjectCarousel />
                </div>

                <Link
                    to="/projects"
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1.5
                        font-mono
                        text-[11.5px]
                        text-(--accent-strong)
                        transition-colors
                        duration-150
                        hover:text-(--accent-deep)
                        hover:underline
                    "
                >
                    See all projects →
                </Link>
            </Container>
        </Section>
    );
}