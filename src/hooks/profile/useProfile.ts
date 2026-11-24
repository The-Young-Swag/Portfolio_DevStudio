import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { profile as staticProfile } from "@/constants/profile";
import {
    getProfile,
    updateProfile,
    type ProfileInput,
} from "@/services/profile/profile";

export function useProfile() {
    const { data, isPending } = useQuery({
        queryKey: ["profile"],
        queryFn: ({ signal }) => getProfile(signal),
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: true,
    });

    return { profile: data ?? staticProfile, isPending };
}

export function useUpdateProfile(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ProfileInput) => updateProfile(input, token),
        onSuccess: (profile) => {
            void queryClient.cancelQueries({ queryKey: ["profile"] });
            queryClient.setQueryData(["profile"], profile);
        },
    });
}
