import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { ProjectShowcase, ProjectShowcaseSkeleton } from "@/components/projects";
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
                compact
            />

            <Section id="projects">
                <Container>
                    {isPending ? (
                        <div className="mt-6">
                            <ProjectShowcaseSkeleton />
                        </div>
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