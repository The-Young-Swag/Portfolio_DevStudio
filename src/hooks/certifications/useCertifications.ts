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

const fallbackCertifications: Certification[] = staticCertifications.map(
    (certification, index) => ({
        ...certification,
        id: -(index + 1),
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
        refetchOnWindowFocus: false,
    });

    return { certifications: data ?? fallbackCertifications, isPending };
}

export function useCreateCertification(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CertificationInput) =>
            createCertification(input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certifications"] });
        },
    });
}

export function useUpdateCertification(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: CertificationInput }) =>
            updateCertification(id, input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certifications"] });
        },
    });
}

export function useDeleteCertification(token: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteCertification(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certifications"] });
        },
    });
}
