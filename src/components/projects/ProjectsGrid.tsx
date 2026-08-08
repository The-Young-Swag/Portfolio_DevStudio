import { projects } from "@/constants/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectsGrid() {
    return (
        <div
            className="
                overflow-hidden
                overflow-x-auto
                rounded-lg
                border
                border-neutral-200
            "
        >
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-neutral-200">
                        <th
                            className="
                                w-[38%]
                                px-4
                                py-3
                                text-left
                                font-mono
                                text-[10.5px]
                                font-normal
                                uppercase
                                tracking-[0.12em]
                                text-neutral-500
                            "
                        >
                            Project
                        </th>

                        <th
                            className="
                                px-4
                                py-3
                                text-left
                                font-mono
                                text-[10.5px]
                                font-normal
                                uppercase
                                tracking-[0.12em]
                                text-neutral-500
                            "
                        >
                            Stack
                        </th>

                        <th
                            className="
                                w-[80px]
                                px-4
                                py-3
                                text-right
                                font-mono
                                text-[10.5px]
                                font-normal
                                uppercase
                                tracking-[0.12em]
                                text-neutral-500
                            "
                        >
                            Year
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.title}
                            title={project.title}
                            description={project.description}
                            stack={project.stack}
                            year={project.year}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}