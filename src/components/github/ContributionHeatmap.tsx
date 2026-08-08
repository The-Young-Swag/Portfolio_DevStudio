import type { ContributionPeriodId } from "./types";

type ContributionHeatmapProps = {
    period: ContributionPeriodId;
};

const intensityClasses = [
    "bg-[#E6E6E9]",
    "bg-[#C6F0DE]",
    "bg-[#8AD9B5]",
    "bg-[#42B683]",
    "bg-[#059669]",
];

const weeks = 52;
const daysPerWeek = 7;

function getContributionLevel(count: number) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;

    return 4;
}

function generateContributionData(period: ContributionPeriodId) {
    const cells = [];

    for (let week = 0; week < weeks; week++) {
        for (let day = 0; day < daysPerWeek; day++) {
            const seed =
                Math.abs(
                    Math.sin(
                        week * 12.9898 +
                            day * 78.233 +
                            period.length * 37.17
                    )
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

export function ContributionHeatmap({
    period,
}: ContributionHeatmapProps) {
    const contributions =
        generateContributionData(period);

    const totalContributions =
        contributions.reduce(
            (total, day) => total + day.count,
            0
        );

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-display text-2xl leading-none">
                    {totalContributions.toLocaleString()}{" "}
                    contributions in the last year
                </p>

                {/* Legend */}
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-500">
                        Less
                    </span>

                    {intensityClasses.map((color) => (
                        <span
                            key={color}
                            className={`h-3 w-3 rounded-[4px] ${color}`}
                        />
                    ))}

                    <span className="font-mono text-[10px] text-neutral-500">
                        More
                    </span>
                </div>
            </div>

            {/* Heatmap */}
            <div className="mt-8 overflow-x-auto">
                <div className="flex min-w-[760px] gap-[3px]">
                    {Array.from({ length: weeks }).map(
                        (_, weekIndex) => (
                            <div
                                key={weekIndex}
                                className="flex flex-col gap-[3px]"
                            >
                                {Array.from({
                                    length: daysPerWeek,
                                }).map((_, dayIndex) => {
                                    const day =
                                        contributions[
                                            weekIndex *
                                                daysPerWeek +
                                                dayIndex
                                        ];

                                    return (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            title={`${day.count} contributions`}
                                            className={`
                                                h-3
                                                w-3
                                                shrink-0
                                                rounded-[4px]
                                                ${intensityClasses[day.level]}
                                            `}
                                        />
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Activity summary */}
            <div className="mt-8 border-t border-neutral-200 pt-6">
                <div className="flex flex-col gap-3 font-mono text-[10.5px] text-neutral-500 sm:flex-row sm:gap-12">
                    <p>
                        Most active:{" "}
                        <span className="text-neutral-700">
                            Tuesdays, for reasons unclear even
                            to me
                        </span>
                    </p>

                    <p>
                        Least active:{" "}
                        <span className="text-neutral-700">
                            Sundays — touch grass protocol
                            engaged
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}