import { projects } from "@/constants/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectsGrid() {
    return (
        <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
                <ProjectCard
                    key={project.title}
                    title={project.title}
                    description={project.description}
                    stack={project.stack}
                />
            ))}
        </div>
    );
}