import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedinIn } from "react-icons/fa6";
import { Globe, Mail } from "lucide-react";
import type { ComponentType } from "react";
import { profile } from "./profile.js";

export type SocialIcon = ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
}>;

const socialIcons: Record<string, SocialIcon> = {
    github: SiGithub,
    linkedin: FaLinkedinIn,
    email: Mail,
};

export function resolveSocialIcon(key: string): SocialIcon {
    return socialIcons[key] ?? Globe;
}

export const socialLinks = [
    {
        label: "GitHub",
        href: profile.github,
        icon: "github",
    },
    {
        label: "LinkedIn",
        href: profile.linkedin,
        icon: "linkedin",
    },
    {
        label: "Email",
        href: profile.email,
        icon: "email",
    },
];
