import { Container, Section } from "@/components/layout";
import { SectionHeading } from "@/components/ui";

import { BuildLog } from "./BuildLog";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { ContributionLegend } from "./ContributionLegend";
import { YearSelector } from "./YearSelector";

export function GitHubActivitySection() {
    return (
        <Section id="build-log">
            <Container>
                <SectionHeading
                    number="01"
                    title="Build Log"
                />

                <div className="space-y-8">
                    <YearSelector />

                    <ContributionHeatmap />

                    <ContributionLegend />

                    <BuildLog />
                </div>
            </Container>
        </Section>
    );
}