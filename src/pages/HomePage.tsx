import { Hero } from "@/components/hero";
import { GitHubActivitySection } from "@/components/github";
import { ProjectsSection } from "@/components/projects";
import { ExperienceSection } from "@/components/experience";

export function HomePage() {
    return (
        <>
            <Hero />

            <GitHubActivitySection />

            <ProjectsSection />

            <ExperienceSection />
        </>
    );
}