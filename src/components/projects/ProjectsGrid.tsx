import { projects } from "@/constants/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectsGrid() {
    return (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
                <ProjectCard
                    key={project.title}
                    index={index}
                    {...project}
                />
            ))}
        </div>
    );
}