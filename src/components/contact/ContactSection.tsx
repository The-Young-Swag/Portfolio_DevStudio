import { ArrowUpRight, Mail } from "lucide-react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { profile } from "@/constants/profile";
import { socialLinks } from "@/constants/socialLinks";

export function ContactSection() {
    return (
        <Section id="contact">
            <Container>
                <SectionHeading number="07" title="Contact" />

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
                            Let's build something.
                        </h3>

                        <p className="mt-2 max-w-xl text-[15px] leading-7 text-(--graphite)">
                            Open to full-time roles and select freelance work.
                            Usually replies within a day — sooner if it's an
                            interesting problem, or there's free food involved.
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
                        Email Ivan
                    </a>
                </div>

                <div className="mt-4 flex flex-wrap gap-6 font-mono text-[12px]">
                    {socialLinks
                        .filter(({ label }) => label !== "Email")
                        .map(({ label, href, icon: Icon }) => (
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
                        ))}
                </div>
            </Container>
        </Section>
    );
}