import { Download } from "lucide-react";

import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { ExperienceList } from "@/components/experience";
import { SectionHeading } from "@/components/ui";
import { useExperience } from "@/hooks/experience/useExperience";
import { useProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";

export function ExperiencePage() {
    const { experience, isPending } = useExperience();
    const { profile } = useProfile();
    const resume = profile.resume ?? staticProfile.resume;

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
                    <SectionHeading number="01" title="Timeline" id="timeline" />

                    <div className="mt-6">
                        {isPending ? (
                            <p className="font-mono text-[10.5px] text-(--graphite)">
                                Loading experience...
                            </p>
                        ) : experience.length === 0 ? (
                            <p className="font-mono text-[10.5px] text-(--graphite)">
                                No experience yet.
                            </p>
                        ) : (
                            <ExperienceList experiences={experience} />
                        )}
                    </div>

                    {resume !== "" && (
                        <div className="mt-6">
                            <a
                                href={resume}
                                download="resume.pdf"
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
                                Download resume
                                <Download size={13} strokeWidth={2} />
                            </a>
                        </div>
                    )}
                </Container>
            </Section>

            <Footer />
        </>
    );
}