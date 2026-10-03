import { Link } from "react-router";

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
                    <SectionHeading number="03" title="Experience" id="experience" />

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

                <Link
                    to="/experience"
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-1.5
                        font-mono
                        text-[11.5px]
                        text-(--accent-strong)
                        transition-colors
                        duration-150
                        hover:text-(--accent-deep)
                        hover:underline
                    "
                >
                    See credentials →
                </Link>
            </Container>
        </Section>
    );
}