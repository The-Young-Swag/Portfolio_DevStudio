import type { ContributionPeriodId } from "./types";
import { ActivityLegend } from "./ActivityLegend";

import { useGitHubContributions } from "@/hooks/github/useGitHubContributions";

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

export function ContributionHeatmap({
    period,
}: ContributionHeatmapProps) {
    const {
        data,
        isPending,
        isError,
        error,
    } = useGitHubContributions(period);

    if (isPending) {
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
                <p
                    className="
                        font-mono
                        text-[10.5px]
                        text-(--graphite)
                    "
                >
                    Loading GitHub activity...
                </p>
            </div>
        );
    }

    if (isError) {
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
                <p
                    className="
                        font-mono
                        text-[10.5px]
                        text-(--graphite)
                    "
                >
                    {error instanceof Error
                        ? error.message
                        : "Unable to load GitHub activity."}
                </p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { calendar } = data;
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
                            Tuesdays, for reasons unclear
                            even to me
                        </span>
                    </p>

                    <p>
                        Least active:{" "}
                        <span className="text-(--ink)">
                            Sundays — touch grass protocol
                            engaged
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}