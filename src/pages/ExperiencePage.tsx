import { Footer, PageHeader, Section } from "@/components/layout";
import { Container } from "@/components/layout";
import { ExperienceList } from "@/components/experience";
import { SectionHeading } from "@/components/ui";
import { useExperience } from "@/hooks/experience/useExperience";

export function ExperiencePage() {
    const { experience, isPending } = useExperience();

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
                </Container>
            </Section>

            <Footer />
        </>
    );
}