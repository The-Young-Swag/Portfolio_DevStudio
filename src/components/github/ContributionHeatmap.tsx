import type { ContributionCalendar } from "./types";
import type { ContributionStats } from "./ContributionStats";

import { ActivityLegend } from "./ActivityLegend";

const CONTRIBUTION_LEVEL_CLASSES = [
    "bg-(--heatmap-0)",
    "bg-(--heatmap-1)",
    "bg-(--heatmap-2)",
    "bg-(--heatmap-3)",
    "bg-(--heatmap-4)",
] as const;

type ContributionHeatmapProps = {
    calendar: ContributionCalendar;
    stats: ContributionStats;
};

export function ContributionHeatmap({
    calendar,
    stats,
}: ContributionHeatmapProps) {

    type Week = (typeof calendar.weeks)[number];
    type Day = Week["days"][number];

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
                        text-(--ink)
                    "
                >
                    {calendar.totalContributions.toLocaleString()}{" "}
                    contributions
                </p>

                <ActivityLegend />
            </div>

            {/* Heatmap */}
            <div className="mt-8 overflow-x-auto">
                <div className="flex justify-center">
                    <div
                        className="
                            flex
                            gap-0.75
                            px-2
                        "
                        role="grid"
                        aria-label="GitHub contribution activity"
                    >
                    {calendar.weeks.map((week: Week, weekIndex: number) => (
                        <div
                            key={weekIndex}
                            className="flex flex-col gap-0.75"
                        >
                            {week.days.map((day: Day) => (
                                <div
                                    key={day.date}
                                    title={`${day.count} contributions — ${day.date}`}
                                    role="gridcell"
                                    aria-label={`${day.count} contributions on ${day.date}`}
                                    className={`
                                        h-2.75
                                        w-2.75
                                        shrink-0
                                        rounded-sm
                                        ${CONTRIBUTION_LEVEL_CLASSES[day.level]}
                                    `}
                                />
                            ))}
                        </div>
                    ))}
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
                        text-(--graphite)
                        sm:flex-row
                        sm:gap-12
                    "
                >
                    <p>
                        Most active:{" "}
                        <span className="text-(--ink)">
                            {stats.mostActiveDay}, for reasons unclear
                            even to me
                        </span>
                    </p>

                    <p>
                        Least active:{" "}
                        <span className="text-(--ink)">
                            {stats.leastActiveDay} — touch grass protocol
                            engaged
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}