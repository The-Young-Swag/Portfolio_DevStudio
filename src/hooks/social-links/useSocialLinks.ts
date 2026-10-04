import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { socialLinks as staticSocialLinks } from "@/constants/socialLinks";
import {
    createSocialLink,
    deleteSocialLink,
    getSocialLinks,
    updateSocialLink,
    type SocialLink,
    type SocialLinkInput,
} from "@/services/social-links/socialLinks";

const fallbackSocialLinks: SocialLink[] = staticSocialLinks.map((link, index) => ({
    ...link,
    id: -(index + 1),
    sort_order: index,
    created_at: "",
}));

export function useSocialLinks() {
    const { data } = useQuery({
        queryKey: ["social-links"],
        queryFn: getSocialLinks,
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return { socialLinks: data ?? fallbackSocialLinks };
}

export function useCreateSocialLink(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: SocialLinkInput) => createSocialLink(input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social-links"] });
        },
    });
}

export function useUpdateSocialLink(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: SocialLinkInput }) =>
            updateSocialLink(id, input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social-links"] });
        },
    });
}

export function useDeleteSocialLink(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteSocialLink(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social-links"] });
        },
    });
}
