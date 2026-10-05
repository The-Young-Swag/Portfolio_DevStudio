import { useQuery } from "@tanstack/react-query";
import {
    Briefcase,
    FileText,
    GraduationCap,
    Image,
    Layers,
    Link2,
    Sparkles,
    User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getCertifications } from "@/services/certifications/certifications";
import { getExperience } from "@/services/experience/experience";
import { getProjects } from "@/services/projects/projects";
import { getSocialLinks } from "@/services/social-links/socialLinks";
import { getStackItems } from "@/services/stack/stackItems";

export type AdminSectionId =
    | "profile"
    | "portrait"
    | "hero-stats"
    | "also-true"
    | "resume"
    | "projects"
    | "experience"
    | "stack"
    | "social-links"
    | "certifications";

type AdminSection = {
    id: AdminSectionId;
    label: string;
    icon: LucideIcon;
    countKey?: "projects" | "experience" | "stack" | "social-links" | "certifications";
};

export const ADMIN_GROUPS: { label: string; sections: AdminSection[] }[] = [
    {
        label: "Site",
        sections: [
            { id: "profile", label: "Profile", icon: User },
            { id: "portrait", label: "Portrait", icon: Image },
            { id: "hero-stats", label: "Home hero", icon: Sparkles },
            { id: "also-true", label: "Also true", icon: Sparkles },
            { id: "resume", label: "Resume", icon: FileText },
        ],
    },
    {
        label: "Content",
        sections: [
            { id: "projects", label: "Projects", icon: Briefcase, countKey: "projects" },
            { id: "experience", label: "Experience", icon: Briefcase, countKey: "experience" },
            { id: "stack", label: "Stack", icon: Layers, countKey: "stack" },
            {
                id: "certifications",
                label: "Certifications",
                icon: GraduationCap,
                countKey: "certifications",
            },
        ],
    },
    {
        label: "Connect",
        sections: [
            { id: "social-links", label: "Social links", icon: Link2, countKey: "social-links" },
        ],
    },
];

// Collection sizes for the sidebar badges. Same query keys as the managers,
// so the cache is shared and nothing fetches twice.
export function useAdminCounts(): Record<string, number | undefined> {
    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const experienceQuery = useQuery({
        queryKey: ["experience"],
        queryFn: getExperience,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const stackQuery = useQuery({
        queryKey: ["stack-items"],
        queryFn: getStackItems,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const certificationsQuery = useQuery({
        queryKey: ["certifications"],
        queryFn: getCertifications,
        retry: 1,
        refetchOnWindowFocus: false,
    });
    const socialLinksQuery = useQuery({
        queryKey: ["social-links"],
        queryFn: getSocialLinks,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return {
        projects: projectsQuery.data?.length,
        experience: experienceQuery.data?.length,
        stack: stackQuery.data?.length,
        certifications: certificationsQuery.data?.length,
        "social-links": socialLinksQuery.data?.length,
    };
}
