import type {
    ContributionCalendar,
    ContributionPeriod,
    ContributionPeriodId,
} from "./types";

import { ContributionHeatmap } from "./ContributionHeatmap";
import { YearSelector } from "./YearSelector";

type BuildLogProps = {
    periods: ContributionPeriod[];
    selectedPeriod: ContributionPeriodId;
    onPeriodChange: (periodId: ContributionPeriodId) => void;
    calendar: ContributionCalendar;
};

export function BuildLog({
    periods,
    selectedPeriod,
    onPeriodChange,
    calendar,
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
                    calendar={calendar}
                />
            </div>
        </>
    );
}