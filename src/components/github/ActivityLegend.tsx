const LEGEND_LEVEL_CLASSES = [
    "bg-[#E6E6E9] dark:bg-[#1F2321]",
    "bg-[#C6F0DE] dark:bg-[#123328]",
    "bg-[#8AD9B5] dark:bg-[#1C5940]",
    "bg-[#42B683] dark:bg-[#278562]",
    "bg-[#059669] dark:bg-[#34D399]",
] as const;

export function ActivityLegend() {
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[var(--graphite)]">
                Less
            </span>

            {LEGEND_LEVEL_CLASSES.map((level) => (
                <span
                    key={level}
                    className={`
                        h-[11px]
                        w-[11px]
                        shrink-0
                        rounded-[3px]
                        ${level}
                    `}
                    aria-hidden="true"
                />
            ))}

            <span className="font-mono text-[10px] text-[var(--graphite)]">
                More
            </span>
        </div>
    );
}