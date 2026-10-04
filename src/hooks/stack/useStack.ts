import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { stack as staticStack } from "@/constants/stack";
import {
    createStackGroup,
    deleteStackGroup,
    getStack,
    updateStackGroup,
    type StackGroup,
    type StackGroupInput,
} from "@/services/stack/stack";

const fallbackStack: StackGroup[] = staticStack.map((group, index) => ({
    group: group.group,
    items: [...group.items],
    id: -(index + 1),
    sort_order: index,
    created_at: "",
}));

export function useStack() {
    const { data, isPending } = useQuery({
        queryKey: ["stack"],
        queryFn: getStack,
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return { stack: data ?? fallbackStack, isPending };
}

export function useCreateStackGroup(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: StackGroupInput) => createStackGroup(input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stack"] });
        },
    });
}

export function useUpdateStackGroup(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: StackGroupInput }) =>
            updateStackGroup(id, input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stack"] });
        },
    });
}

export function useDeleteStackGroup(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteStackGroup(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stack"] });
        },
    });
}
