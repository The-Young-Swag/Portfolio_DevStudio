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
        icon: Home,
    },
    {
        id: "projects",
        label: "Projects",
        icon: FolderKanban,
    },
    {
        id: "experience",
        label: "Experience",
        icon: BriefcaseBusiness,
    },
    {
        id: "stack",
        label: "Stack",
        icon: Layers3,
    },
    {
        id: "certification",
        label: "Certification",
        icon: GraduationCap,
    },
];