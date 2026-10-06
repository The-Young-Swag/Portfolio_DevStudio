import { Star } from "lucide-react";

type CoreLegendProps = {
    className?: string;
};

/**
 * One-line legend explaining the gold core-skill star used on skill pills.
 */
export function CoreLegend({ className }: CoreLegendProps) {
    return (
        <p
            className={`
                flex
                items-center
                gap-1.5
                font-mono
                text-[11px]
                text-(--graphite-soft)
                ${className ?? ""}
            `}
        >
            <Star
                size={12}
                strokeWidth={2}
                aria-hidden="true"
                fill="currentColor"
                className="shrink-0 text-amber-500 dark:text-amber-400"
            />
            core
        </p>
    );
}
