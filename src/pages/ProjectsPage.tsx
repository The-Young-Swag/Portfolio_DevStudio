import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { ProjectShowcase } from "@/components/projects";
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

            <Section id="projects">
                <Container>
                    {isPending ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            Loading projects...
                        </p>
                    ) : projects.length === 0 ? (
                        <p className="mt-6 font-mono text-[10.5px] text-(--graphite)">
                            No projects yet.
                        </p>
                    ) : (
                        <ProjectShowcase projects={projects} />
                    )}
                </Container>
            </Section>

            <Footer />
        </>
    );
}