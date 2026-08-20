import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { ExperienceList } from "@/components/experience";
import { SectionHeading } from "@/components/ui";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { profile } from "@/constants/profile";

export function ExperiencePage() {
    return (
        <>
            <PageHeader
                index="03"
                title="Experience"
                eyebrow="the work so far"
                description="Where I've applied what I'm learning — real users, real deadlines, and the occasional debugging session that ran past midnight. Early-career, but earned the honest way."
            />

            <Section id="timeline">
                <Container>
                    <SectionHeading number="01" title="Timeline" />

                    <div className="mt-6">
                        <ExperienceList />
                    </div>
                </Container>
            </Section>

            <Section id="receipts">
                <Container>
                    <SectionHeading number="02" title="Receipts" />

                    <div className="mt-6 rounded-2xl border border-(--glass-border) bg-(--glass-bg) p-6 shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-160 sm:p-7">
                        <p className="max-w-xl text-[13px] leading-relaxed text-(--graphite)">
                            Paperwork, the unglamorous half of the story. The
                            résumé has the trimmed version; the certifications
                            page has the proof I actually finished the courses.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <a
                                href={profile.resume}
                                target="_blank"
                                rel="noreferrer"
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-(--accent-strong)
                                    bg-(--accent-strong)
                                    px-4
                                    py-2
                                    text-[12.5px]
                                    font-medium
                                    text-white
                                    shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
                                    transition-colors
                                    duration-150
                                    hover:bg-(--accent-deep)
                                    hover:border-(--accent-deep)
                                "
                            >
                                Résumé
                                <ArrowUpRight size={13} strokeWidth={2} />
                            </a>

                            <Link
                                to="/certifications"
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-(--glass-border)
                                    bg-(--glass-bg)
                                    px-4
                                    py-2
                                    text-[12.5px]
                                    font-medium
                                    text-(--ink)
                                    shadow-[inset_0_1px_0_var(--glass-highlight)]
                                    backdrop-blur-md
                                    transition-colors
                                    duration-150
                                    hover:border-(--accent-strong)
                                    hover:text-(--accent-strong)
                                "
                            >
                                Certifications
                                <ArrowUpRight size={13} strokeWidth={1.75} />
                            </Link>
                        </div>
                    </div>
                </Container>
            </Section>

            <Footer />
        </>
    );
}