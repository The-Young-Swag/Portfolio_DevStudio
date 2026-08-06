import { Section, Container } from "@/components/layout";
import { BuildLog } from "./BuildLog";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { ContributionLegend } from "./ContributionLegend";
import { YearSelector } from "./YearSelector";

export function GitHubActivitySection() {
    return (
        <Section id="buildlog">
            <Container>
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