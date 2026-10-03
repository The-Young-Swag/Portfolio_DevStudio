import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projects as staticProjects } from "@/constants/projects";
import {
    createProject,
    deleteProject,
    getProjects,
    updateProject,
    type Project,
    type ProjectInput,
} from "@/services/projects/projects";

const fallbackProjects: Project[] = staticProjects.map((project, index) => ({
    ...project,
    id: -(index + 1),
    repo_url: "",
    live_url: "",
    source_access: null,
    demo_access: null,
    access_note: "",
    has_case_study: false,
    case_problem: "",
    case_role: "",
    case_solution: "",
    case_result: "",
    case_screenshots: [],
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

export function useCreateProject(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ProjectInput) => createProject(input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}

export function useUpdateProject(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: ProjectInput }) =>
            updateProject(id, input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}

export function useDeleteProject(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteProject(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}
