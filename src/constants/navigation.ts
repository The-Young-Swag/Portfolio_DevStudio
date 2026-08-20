import {
    BriefcaseBusiness,
    FolderKanban,
    GraduationCap,
    Home,
    Layers3,
} from "lucide-react";

export const navigation = [
    {
        id: "overview",
        label: "Home",
        href: "/",
        icon: Home,
    },
    {
        id: "projects",
        label: "Projects",
        href: "/projects",
        icon: FolderKanban,
    },
    {
        id: "experience",
        label: "Experience",
        href: "/experience",
        icon: BriefcaseBusiness,
    },
    {
        id: "stack",
        label: "Stack",
        href: "/stack",
        icon: Layers3,
    },
    {
        id: "certification",
        label: "Certification",
        href: "/certifications",
        icon: GraduationCap,
    },
];

export type NavigationItem = (typeof navigation)[number];