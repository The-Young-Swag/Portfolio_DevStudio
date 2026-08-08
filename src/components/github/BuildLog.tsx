import { useState } from "react";

import { ContributionHeatmap } from "./ContributionHeatmap";
import { YearSelector } from "./YearSelector";

import type {
    ContributionPeriod,
    ContributionPeriodId,
} from "./types";

const periods: ContributionPeriod[] = [
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

export function BuildLog() {
    const [selectedPeriod, setSelectedPeriod] =
        useState<ContributionPeriodId>(
            "last-12-months"
        );

    return (
        <div>
            <YearSelector
                periods={periods}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
            />

            <div className="mt-6">
                <ContributionHeatmap
                    period={selectedPeriod}
                />
            </div>
        </div>
    );
}