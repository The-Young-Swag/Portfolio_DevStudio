import { useQuery } from "@tanstack/react-query";

import { projects as staticProjects } from "@/constants/projects";
import { getProjects, type Project } from "@/services/projects/projects";

const fallbackProjects: Project[] = staticProjects.map((project, index) => ({
    ...project,
    id: -(index + 1),
    sort_order: index,
    created_at: "",
}));

export function useProjects() {
    const { data, isPending } = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return { projects: data ?? fallbackProjects, isPending };
}
