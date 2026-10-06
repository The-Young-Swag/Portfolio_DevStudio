import { Link } from "react-router";

import { Carousel } from "@/components/carousel";
import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { useProjects } from "@/hooks/projects/useProjects";
import { ProjectCard } from "./ProjectCard";


export function ProjectsSection() {
    const { projects, isPending } = useProjects();

    return (
        <Section id="projects">
            <Container>
                {isPending ? (
                    <>
                        <SectionHeading
                            number="02"
                            title="Projects"
                            id="projects"
                        />

                        <p className="mt-5 font-mono text-[10.5px] text-(--graphite)">
                            Loading projects...
                        </p>
                    </>
                ) : projects.length === 0 ? (
                    <>
                        <SectionHeading
                            number="02"
                            title="Projects"
                            id="projects"
                        />

                        <p className="mt-5 font-mono text-[10.5px] text-(--graphite)">
                            No projects yet.
                        </p>
                    </>
                ) : (
                    <Carousel
                        label="Projects"
                        heading={
                            <SectionHeading
                                number="02"
                                title="Projects"
                                id="projects"
                            />
                        }
                        previousLabel="Previous projects"
                        nextLabel="Next projects"
                        gap="1.25rem"
                    >
                        {projects.map((project, index) => (
                            <div key={project.id} className="carousel-card">
                                <ProjectCard project={project} index={index} />
                            </div>
                        ))}
                    </Carousel>
                )}

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