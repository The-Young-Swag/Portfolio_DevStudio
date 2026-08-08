type ContributionHeatmapProps = {
    year: number;
};

const weeks = 52;
const days = 7;

const intensityClasses = [
    "bg-[#E6E6E9]", // Less
    "bg-[#C6F0DE]",
    "bg-[#8AD9B5]",
    "bg-[#42B683]",
    "bg-[#059669]", // More
];

function getIntensity(week: number, day: number) {
    const value =
        (week * 17 + day * 13 + week * day * 3) % 11;

    if (value <= 3) return 0;
    if (value <= 5) return 1;
    if (value <= 7) return 2;
    if (value <= 9) return 3;

    return 4;
}

export function ContributionHeatmap({
    year,
}: ContributionHeatmapProps) {
    return (
        <div
            className="
                overflow-hidden
                rounded-xl
                border
                border-neutral-200
                bg-white
            "
        >
            {/* Header */}
            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-6
                    px-6
                    pt-7
                    sm:px-10
                "
            >
                <h3
                    className="
                        font-display
                        text-xl
                        leading-none
                        text-neutral-950
                        sm:text-2xl
                    "
                >
                    1,284 contributions in the last year
                </h3>

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        font-mono
                        text-[10px]
                        text-neutral-500
                    "
                >
                    <span>Less</span>

                    {intensityClasses.map((className) => (
                        <span
                            key={className}
                            className={`
                                h-3
                                w-3
                                rounded-[4px]
                                ${className}
                            `}
                        />
                    ))}

                    <span>More</span>
                </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto px-6 py-8 sm:px-10">
                <div
                    className="
                        flex
                        min-w-[760px]
                        gap-1
                    "
                >
                    {Array.from({ length: weeks }).map(
                        (_, weekIndex) => (
                            <div
                                key={weekIndex}
                                className="flex flex-col gap-1"
                            >
                                {Array.from({
                                    length: days,
                                }).map((_, dayIndex) => {
                                    const intensity =
                                        getIntensity(
                                            weekIndex,
                                            dayIndex,
                                        );

                                    return (
                                        <span
                                            key={`${weekIndex}-${dayIndex}`}
                                            title={`${year} contribution activity`}
                                            className={`
                                                h-3
                                                w-3
                                                shrink-0
                                                rounded-[4px]
                                                ${intensityClasses[intensity]}
                                            `}
                                        />
                                    );
                                })}
                            </div>
                        ),
                    )}
                </div>
            </div>

            {/* Activity notes */}
            <div
                className="
                    mx-6
                    border-t
                    border-neutral-200
                    px-0
                    py-5
                    sm:mx-10
                    sm:py-6
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        font-mono
                        text-[11px]
                        leading-relaxed
                        text-neutral-500
                        sm:flex-row
                        sm:gap-10
                    "
                >
                    <p>
                        Most active:
                        <span className="ml-1 text-neutral-950">
                            Tuesdays, for reasons unclear even to me
                        </span>
                    </p>

                    <p>
                        Least active:
                        <span className="ml-1 text-neutral-950">
                            Sundays — touch grass protocol engaged
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}