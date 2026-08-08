import { Hero } from "@/components/hero";
import { GitHubActivitySection } from "@/components/github";
import { ProjectsSection } from "@/components/projects";

export function HomePage() {
    return (
        <>
            <Hero />

            <GitHubActivitySection />

            <ProjectsSection />
        </>
    );
}