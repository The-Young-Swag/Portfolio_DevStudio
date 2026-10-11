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
import { insertListed, removeListed, replaceListed } from "../listCache";

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
        refetchOnWindowFocus: true,
    });

    return { socialLinks: data ?? fallbackSocialLinks };
}

export function useCreateSocialLink(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: SocialLinkInput) => createSocialLink(input, token),
        onSuccess: (link) => {
            insertListed(queryClient, ["social-links"], link);
        },
    });
}

export function useUpdateSocialLink(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: SocialLinkInput }) =>
            updateSocialLink(id, input, token),
        onSuccess: (link) => {
            replaceListed(queryClient, ["social-links"], link);
        },
    });
}

export function useDeleteSocialLink(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteSocialLink(id, token),
        onSuccess: (_data, id) => {
            removeListed(queryClient, ["social-links"], id);
        },
    });
}
