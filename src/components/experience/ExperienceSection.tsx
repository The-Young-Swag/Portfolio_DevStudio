import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";
import { useExperience } from "@/hooks/experience/useExperience";

import { ExperienceList } from "./ExperienceList";

export function ExperienceSection() {
    const { experience, isPending } = useExperience();

    return (
        <Section id="experience">
            <Container>
                <div className="flex items-baseline justify-between">
                    <SectionHeading number="03" title="Experience" />

                    <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-(--graphite-soft)">
                        2024 — present
                    </span>
                </div>

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
    );
}