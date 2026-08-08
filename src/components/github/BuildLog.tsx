type ContributionHeatmapProps = {
    year: number;
};

const weeks = 52;
const days = 7;

function getIntensity(week: number, day: number) {
    const value =
        (week * 17 + day * 13 + week * day * 3) % 11;

    if (value <= 3) return 0;
    if (value <= 5) return 1;
    if (value <= 7) return 2;
    if (value <= 9) return 3;

    return 4;
}

const intensityClasses = [
    "bg-neutral-100",
    "bg-[#d7e5df]",
    "bg-[#a9c8bb]",
    "bg-[#6fa58f]",
    "bg-[#40826D]",
];

export function ContributionHeatmap({
    year,
}: ContributionHeatmapProps) {
    return (
        <div className="overflow-x-auto">
            <div
                className="
                    min-w-[760px]
                    border-y
                    border-neutral-200
                    py-5
                "
            >
                <div className="flex gap-1">
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
                                                block
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
        </div>
    );
}