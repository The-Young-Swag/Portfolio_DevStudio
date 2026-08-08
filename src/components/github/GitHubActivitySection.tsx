import { useState } from "react";

import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { ContributionHeatmap } from "./ContributionHeatmap";
import { YearSelector } from "./YearSelector";

export function GitHubActivitySection() {
    const [selectedYear, setSelectedYear] = useState(2026);

    return (
        <Section id="build-log">
            <Container>
                <SectionHeading
                    number="01"
                    title="Build log"
                />

                <div className="mt-8 space-y-6">
                    <YearSelector
                        selectedYear={selectedYear}
                        onYearChange={setSelectedYear}
                    />

                    <ContributionHeatmap
                        year={selectedYear}
                    />
                </div>
            </Container>
        </Section>
    );
}