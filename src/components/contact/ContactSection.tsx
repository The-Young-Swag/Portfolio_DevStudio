import { Mail } from "lucide-react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { profile } from "@/constants/profile";

export function ContactSection() {
    return (
        <Section id="contact">
            <Container>
                <SectionHeading
                    number="07"
                    title="Contact"
                />

                <div
                    className="
                        mt-5
                        flex
                        flex-col
                        gap-8
                        rounded-lg
                        border
                        border-[#059669]/20
                        bg-[#059669]/[0.06]
                        p-6
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:p-8
                    "
                >
                    <div className="max-w-2xl">
                        <h3
                            className="
                                font-display
                                text-[18px]
                                font-medium
                                leading-tight
                                text-neutral-950
                            "
                        >
                            Let's build something.
                        </h3>

                        <p
                            className="
                                mt-2
                                max-w-xl
                                text-[15px]
                                leading-7
                                text-neutral-600
                            "
                        >
                            Open to full-time roles and select
                            freelance work. Usually replies within
                            a day — sooner if it's an interesting
                            problem, or there's free food involved.
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
                            rounded-md
                            bg-[#059669]
                            px-5
                            py-2.5
                            text-[13px]
                            font-medium
                            text-white
                            transition-colors
                            duration-150
                            hover:bg-[#047857]
                        "
                    >
                        <Mail size={14} />
                        Email Ivan
                    </a>
                </div>
            </Container>
        </Section>
    );
}