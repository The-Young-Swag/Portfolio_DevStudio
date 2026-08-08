import { useState } from "react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { ContributionHeatmap } from "./ContributionHeatmap";
import { YearSelector } from "./YearSelector";

import type {
    ContributionPeriod,
    ContributionPeriodId,
} from "./types";

const availablePeriods: ContributionPeriod[] = [
    {
        id: "last-12-months",
        label: "Last 12 Months",
    },
    {
        id: "2025",
        label: "2025",
        year: 2025,
    },
    {
        id: "2024",
        label: "2024",
        year: 2024,
    },
    {
        id: "2023",
        label: "2023",
        year: 2023,
    },
];

export function GitHubActivitySection() {
    const [selectedPeriod, setSelectedPeriod] =
        useState<ContributionPeriodId>(
            "last-12-months"
        );

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
                            period={selectedPeriod}
                        />
                    </div>
                </div>
            </Container>
        </Section>
    );
}