import type {
    ContributionPeriod,
    ContributionPeriodId,
} from "./types";

import { ContributionHeatmap } from "./ContributionHeatmap";
import { YearSelector } from "./YearSelector";

type BuildLogProps = {
    periods: ContributionPeriod[];
    selectedPeriod: ContributionPeriodId;
    onPeriodChange: (periodId: ContributionPeriodId) => void;
};

export function BuildLog({
    periods,
    selectedPeriod,
    onPeriodChange,
}: BuildLogProps) {
    return (
        <>
            <YearSelector
                periods={periods}
                selectedPeriod={selectedPeriod}
                onPeriodChange={onPeriodChange}
            />

            <div className="mt-6">
                <ContributionHeatmap
                    period={selectedPeriod}
                />
            </div>
        </>
    );
}