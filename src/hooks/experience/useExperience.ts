import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { experiences as staticExperience } from "@/constants/experience";
import {
    createExperienceEntry,
    deleteExperienceEntry,
    getExperience,
    updateExperienceEntry,
    type ExperienceEntry,
    type ExperienceInput,
} from "@/services/experience/experience";

const fallbackExperience: ExperienceEntry[] = staticExperience.map(
    (entry, index) => ({
        ...entry,
        id: -(index + 1),
        sort_order: index,
        created_at: "",
    }),
);

export function useExperience() {
    const { data, isPending } = useQuery({
        queryKey: ["experience"],
        queryFn: getExperience,
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: true,
    });

    return { experience: data ?? fallbackExperience, isPending };
}

export function useCreateExperienceEntry(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ExperienceInput) => createExperienceEntry(input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experience"] });
        },
    });
}

export function useUpdateExperienceEntry(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: ExperienceInput }) =>
            updateExperienceEntry(id, input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experience"] });
        },
    });
}

export function useDeleteExperienceEntry(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteExperienceEntry(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["experience"] });
        },
    });
}
