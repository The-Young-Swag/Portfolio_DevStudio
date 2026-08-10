const LEGEND_LEVEL_CLASSES = [
    "bg-(--heatmap-0)",
    "bg-(--heatmap-1)",
    "bg-(--heatmap-2)",
    "bg-(--heatmap-3)",
    "bg-(--heatmap-4)",
] as const;

export function ActivityLegend() {
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-(--graphite)">
                Less
            </span>

            {LEGEND_LEVEL_CLASSES.map((level) => (
                <span
                    key={level}
                    className={`
                        h-2.75
                        w-2.75
                        shrink-0
                        rounded-[3px]
                        ${level}
                    `}
                    aria-hidden="true"
                />
            ))}

            <span className="font-mono text-[10px] text-(--graphite)">
                More
            </span>
        </div>
    );
}