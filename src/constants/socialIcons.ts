import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedinIn } from "react-icons/fa6";
import { Globe, Mail } from "lucide-react";
import type { ComponentType } from "react";

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
