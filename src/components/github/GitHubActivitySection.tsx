import { useState } from "react";

import { useGitHubContributions } from "@/hooks/github/useGitHubContributions";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { ContributionHeatmap } from "./ContributionHeatmap";
import { YearSelector } from "./YearSelector";

import type {
    ContributionPeriodId,
} from "./types";



export function GitHubActivitySection() {
    const [selectedPeriod, setSelectedPeriod] =
        useState<ContributionPeriodId>(
            "last-12-months",
        );

        const {
            data,
            isPending,
            isError,
            error,
        } = useGitHubContributions(
            selectedPeriod,
        );

        if (isPending && !data) {
            return (
                <Section id="build-log">
                    <Container>
                        <SectionHeading
                            number="01"
                            title="Build log"
                        />
        
                        <p className="mt-8 font-mono text-[10.5px] text-(--graphite)">
                            Loading GitHub activity...
                        </p>
                    </Container>
                </Section>
            );
        }
        
        if (isError) {
            return (
                <Section id="build-log">
                    <Container>
                        <SectionHeading
                            number="01"
                            title="Build log"
                        />
        
                        <p className="mt-8 font-mono text-[10.5px] text-(--graphite)">
                            {error instanceof Error
                                ? error.message
                                : "Unable to load GitHub activity."}
                        </p>
                    </Container>
                </Section>
            );
        }
        
        if (!data) {
            return null;
        }

        const availablePeriods = [
            {
                id: "last-12-months" as const,
                label: "Last 12 Months",
            },
        
            ...data.availableYears.map(
                (year) => ({
                    id: String(year) as ContributionPeriodId,
                    label: String(year),
                    year,
                }),
            ),
        ];

    return (
        <Section id="build-log">
            <Container>
                <SectionHeading
                    number="01"
                    title="Build log"
                />

                <div className="mt-8">
                    <YearSelector
                        periods={availablePeriods}
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />

                    <div className="mt-6">
                        <ContributionHeatmap
                        calendar={data.calendar}
                        />
                    </div>
                </div>
            </Container>
        </Section>
    );
}