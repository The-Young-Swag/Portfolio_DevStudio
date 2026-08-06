import { SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedinIn } from "react-icons/fa6";
import { Mail } from "lucide-react";
import { profile } from "@/constants/profile";

export const socialLinks = [
    {
        label: "GitHub",
        href: profile.github,
        icon: SiGithub,
    },
    {
        label: "LinkedIn",
        href: profile.linkedin,
        icon: FaLinkedinIn,
    },
    {
        label: "Email",
        href: profile.email,
        icon: Mail,
    },
];