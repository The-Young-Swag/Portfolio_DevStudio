import type { Project } from "@/services/projects/projects";
import { ProjectCard } from "./ProjectCard";

type ProjectsGridProps = {
    projects: Project[];
};

export function ProjectsGrid({ projects }: ProjectsGridProps) {
    return (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
                <ProjectCard
                    key={project.id}
                    index={index}
                    {...project}
                />
            ))}
        </div>
    );
}