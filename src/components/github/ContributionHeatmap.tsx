import type { ContributionPeriodId } from "./types";
import { ActivityLegend } from "./ActivityLegend";

const CONTRIBUTION_LEVEL_CLASSES = [
    "bg-[#E6E6E9] dark:bg-[#1F2321]",
    "bg-[#C6F0DE] dark:bg-[#123328]",
    "bg-[#8AD9B5] dark:bg-[#1C5940]",
    "bg-[#42B683] dark:bg-[#278562]",
    "bg-[#059669] dark:bg-[#34D399]",
] as const;

type ContributionHeatmapProps = {
    period: ContributionPeriodId;
};

type ContributionCell = {
    count: number;
    level: number;
};

const WEEKS = 52;
const DAYS_PER_WEEK = 7;

function getContributionLevel(count: number) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;

    return 4;
}

function generateContributionData(
    period: ContributionPeriodId,
): ContributionCell[] {
    const cells: ContributionCell[] = [];

    for (let week = 0; week < WEEKS; week++) {
        for (
            let day = 0;
            day < DAYS_PER_WEEK;
            day++
        ) {
            const seed = Math.abs(
                Math.sin(
                    week * 12.9898 +
                        day * 78.233 +
                        period.length * 37.17,
                ),
            );

            const count =
                seed > 0.82
                    ? 10 + Math.floor(seed * 8)
                    : seed > 0.66
                      ? 6 + Math.floor(seed * 4)
                      : seed > 0.46
                        ? 3 + Math.floor(seed * 3)
                        : seed > 0.28
                          ? 1 + Math.floor(seed * 2)
                          : 0;

            cells.push({
                count,
                level: getContributionLevel(count),
            });
        }
    }

    return cells;
}

function getTotalContributions(
    contributions: ContributionCell[],
) {
    return contributions.reduce(
        (total, day) => total + day.count,
        0,
    );
}

export function ContributionHeatmap({
    period,
}: ContributionHeatmapProps) {
    const contributions =
        generateContributionData(period);

    const totalContributions =
        getTotalContributions(contributions);

    return (
        <div
            className="
                overflow-hidden
                rounded-[26px]
                glass
                p-7
                sm:p-9
            "
        >
            {/* Header */}
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                <p
                    className="
                        font-display
                        text-2xl
                        leading-none
                        text-[var(--ink)]
                    "
                >
                    {totalContributions.toLocaleString()}{" "}
                    contributions in the last year
                </p>

                <ActivityLegend />
            </div>

            {/* Heatmap */}
            <div className="mt-8 overflow-x-auto">
                <div className="flex justify-center">
                    <div
                        className="
                            flex
                            gap-[3px]
                            px-2
                        "
                        role="grid"
                        aria-label="Contribution activity"
                    >
                    {Array.from({ length: WEEKS }).map(
                        (_, weekIndex) => (
                            <div
                                key={weekIndex}
                                className="flex flex-col gap-[3px]"
                            >
                                {Array.from({
                                    length: DAYS_PER_WEEK,
                                }).map((_, dayIndex) => {
                                    const day =
                                        contributions[
                                            weekIndex *
                                                DAYS_PER_WEEK +
                                                dayIndex
                                        ];

                                    return (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            title={`${day.count} contributions`}
                                            role="gridcell"
                                            aria-label={`${day.count} contributions`}
                                            className={`
                                                h-[11px]
                                                w-[11px]
                                                shrink-0
                                                rounded-[4px]
                                                ${CONTRIBUTION_LEVEL_CLASSES[day.level]}
                                            `}
                                        />
                                    );
                                })}
                            </div>
                        ),
                    )}
                </div>
            </div>
            </div>

            {/* Activity summary */}
            <div
                className="
                    mt-8
                    border-t
                    hairline
                    pt-6
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        font-mono
                        text-[10.5px]
                        text-[var(--graphite)]
                        sm:flex-row
                        sm:gap-12
                    "
                >
                    <p>
                        Most active:{" "}
                        <span className="text-[var(--ink)]">
                            Tuesdays, for reasons unclear
                            even to me
                        </span>
                    </p>

                    <p>
                        Least active:{" "}
                        <span className="text-[var(--ink)]">
                            Sundays — touch grass protocol
                            engaged
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}