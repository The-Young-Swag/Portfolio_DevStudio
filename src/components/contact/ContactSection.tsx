import { ArrowUpRight, Mail } from "lucide-react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { useProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import { resolveSocialIcon } from "@/constants/socialLinks";
import { useSocialLinks } from "@/hooks/social-links/useSocialLinks";

export function ContactSection() {
    const { profile } = useProfile();
    const { socialLinks } = useSocialLinks();

    const heading = profile.contact_heading ?? staticProfile.contact_heading;
    const title = profile.contact_title ?? staticProfile.contact_title;
    const intro = profile.contact_intro ?? staticProfile.contact_intro;
    const emailLabel = profile.contact_email_label ?? staticProfile.contact_email_label;

    return (
        <Section id="contact">
            <Container>
                <SectionHeading number="07" title={heading} />

                <div
                    className="
                        mt-5
                        flex
                        flex-col
                        gap-8
                        rounded-2xl
                        border
                        border-(--glass-border)
                        bg-(--glass-bg)
                        p-6
                        shadow-[inset_0_1px_0_var(--glass-highlight),0_10px_30px_-20px_rgba(31,38,135,0.12)]
                        backdrop-blur-xl
                        backdrop-saturate-160
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:p-8
                    "
                >
                    <div className="max-w-2xl">
                        <h3 className="font-display text-[20px] font-medium leading-tight text-(--ink)">
                            {title}
                        </h3>

                        <p className="mt-2 max-w-xl text-[15px] leading-7 text-(--graphite)">
                            {intro}
                        </p>
                    </div>

                    <a
                        href={`mailto:${profile.email}`}
                        className="
                            inline-flex
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            whitespace-nowrap
                            rounded-lg
                            border
                            border-(--accent-strong)
                            bg-(--accent-strong)
                            px-5
                            py-2.5
                            text-[13px]
                            font-medium
                            text-white
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
                            transition-colors
                            duration-150
                            hover:bg-(--accent-deep)
                            hover:border-(--accent-deep)
                        "
                    >
                        <Mail size={14} strokeWidth={2} />
                        {emailLabel}
                    </a>
                </div>

                <div className="mt-4 flex flex-wrap gap-6 font-mono text-[12px]">
                    {socialLinks
                        .filter(({ icon }) => icon !== "email")
                        .map(({ label, href, icon }) => {
                            const Icon = resolveSocialIcon(icon);

                            return (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        text-(--graphite)
                                        transition-colors
                                        duration-150
                                        hover:text-(--accent-strong)
                                    "
                                >
                                    <Icon size={13} strokeWidth={1.75} />
                                    {label}
                                    <ArrowUpRight size={12} strokeWidth={1.75} />
                                </a>
                            );
                        })}
                </div>
            </Container>
        </Section>
    );
}