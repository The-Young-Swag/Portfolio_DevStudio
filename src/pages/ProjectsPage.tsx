import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { ProjectDetails, ProjectsGrid } from "@/components/projects";
import { SectionHeading } from "@/components/ui";
import { useProjects } from "@/hooks/projects/useProjects";

export function ProjectsPage() {
    const { projects, isPending } = useProjects();

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

                    {isPending ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            Loading projects...
                        </p>
                    ) : projects.length === 0 ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            No projects yet.
                        </p>
                    ) : (
                        <ProjectsGrid projects={projects} />
                    )}
                </Container>
            </Section>

            <Section id="details">
                <Container>
                    <SectionHeading number="02" title="Details" />

                    {isPending ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            Loading projects...
                        </p>
                    ) : projects.length === 0 ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            No projects yet.
                        </p>
                    ) : (
                        <ProjectDetails projects={projects} />
                    )}
                </Container>
            </Section>

            <Footer />
        </>
    );
}