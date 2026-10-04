import { Link } from "react-router";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { useProjects } from "@/hooks/projects/useProjects";
import { ProjectCarousel } from "./ProjectCarousel";


export function ProjectsSection() {
    const { projects, isPending } = useProjects();

    return (
        <Section id="projects">
            <Container>
                <SectionHeading
                    number="02"
                    title="Selected projects"
                />

                <div className="mt-5">
                    {isPending ? (
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            Loading projects...
                        </p>
                    ) : projects.length === 0 ? (
                        <p className="font-mono text-[10.5px] text-(--graphite)">
                            No projects yet.
                        </p>
                    ) : (
                        <ProjectCarousel projects={projects} />
                    )}
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