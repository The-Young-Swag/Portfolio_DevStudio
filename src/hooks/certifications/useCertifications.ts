import { useQuery } from "@tanstack/react-query";

import { certifications as staticCertifications } from "@/constants/certifications";
import {
    getCertifications,
    type Certification,
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
