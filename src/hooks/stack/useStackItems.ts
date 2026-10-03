import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { stackItems as staticStackItems } from "@/constants/stack";
import {
    createStackItem,
    deleteStackItem,
    getStackItems,
    updateStackItem,
    type StackItem,
    type StackItemInput,
} from "@/services/stack/stackItems";

const fallbackStackItems: StackItem[] = staticStackItems.map((item, index) => ({
    ...item,
    id: -(index + 1),
    sort_order: index,
    created_at: "",
}));

export function useStackItems() {
    const { data, isPending } = useQuery({
        queryKey: ["stack-items"],
        queryFn: getStackItems,
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return { stackItems: data ?? fallbackStackItems, isPending };
}

export function useCreateStackItem(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: StackItemInput) => createStackItem(input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stack-items"] });
        },
    });
}

export function useUpdateStackItem(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: StackItemInput }) =>
            updateStackItem(id, input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stack-items"] });
        },
    });
}

export function useDeleteStackItem(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteStackItem(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stack-items"] });
        },
    });
}
