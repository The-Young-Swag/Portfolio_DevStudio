import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { certifications as staticCertifications } from "@/constants/certifications";
import {
    createCertification,
    deleteCertification,
    getCertifications,
    updateCertification,
    type Certification,
    type CertificationInput,
} from "@/services/certifications/certifications";
import { insertListed, replaceListed } from "../listCache";

const fallbackCertifications: Certification[] = staticCertifications.map(
    (certification, index) => ({
        ...certification,
        id: -(index + 1),
        image: "",
        link: "",
        parent_id: null,
        pdf: "",
        badge_image: "",
        badge_link: "",
        sort_order: index,
        created_at: "",
    }),
);

export function useCertifications() {
    const { data, isPending } = useQuery({
        queryKey: ["certifications"],
        queryFn: getCertifications,
        staleTime: 1000 * 60,
        retry: 1,
        refetchOnWindowFocus: true,
    });

    return { certifications: data ?? fallbackCertifications, isPending };
}

export function useCreateCertification(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CertificationInput) =>
            createCertification(input, token),
        onSuccess: (certification) => {
            insertListed(queryClient, ["certifications"], certification);
        },
    });
}

export function useUpdateCertification(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: CertificationInput }) =>
            updateCertification(id, input, token),
        onSuccess: (certification) => {
            replaceListed(queryClient, ["certifications"], certification);
        },
    });
}

export function useDeleteCertification(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteCertification(id, token),
        onSuccess: (_data, id) => {
            // Deleting a parent cascades to its courses server-side, so
            // drop the whole subtree from the cache, not just the parent.
            void queryClient.cancelQueries({ queryKey: ["certifications"] });
            queryClient.setQueryData<Certification[]>(["certifications"], (current) => {
                const doomed = new Set([id]);

                for (const item of current ?? []) {
                    if (item.parent_id !== null && doomed.has(item.parent_id)) {
                        doomed.add(item.id);
                    }
                }

                return (current ?? []).filter((item) => !doomed.has(item.id));
            });
        },
    });
}
