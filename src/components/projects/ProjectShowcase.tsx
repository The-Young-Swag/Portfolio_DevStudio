import { useEffect, useState } from "react";

import type { Project } from "@/services/projects/projects";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectIndex } from "./ProjectIndex";
import { projectTabId } from "./projectStatus";

function idFromHash(): number | null {
    const match = window.location.hash.match(/^#project-(\d+)$/);

    if (!match) {
        return null;
    }

    const id = Number(match[1]);

    return Number.isInteger(id) ? id : null;
}

export function ProjectShowcase({ projects }: { projects: Project[] }) {
    const [selectedId, setSelectedId] = useState<number | null>(() => idFromHash());

    const selected = projects.find((project) => project.id === selectedId) ?? null;
    const active = selected ?? projects[0] ?? null;

    useEffect(() => {
        function handleHashChange() {
            const id = idFromHash();

            if (id === null) {
                return;
            }

            setSelectedId(id);
        }

        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    function select(id: number) {
        setSelectedId(id);
        window.history.replaceState(null, "", `#project-${id}`);
    }

    if (active === null) {
        return null;
    }

    if (projects.length === 1) {
        return <ProjectDetail project={active} tabId={null} />;
    }

    return (
        <div>
            <ProjectIndex projects={projects} selectedId={active.id} onSelect={select} />

            <div className="mt-2 min-w-0">
                <ProjectDetail
                    key={active.id}
                    project={active}
                    tabId={projectTabId(active.id)}
                />
            </div>
        </div>
    );
}
