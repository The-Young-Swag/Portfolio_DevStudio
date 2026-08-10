import type { LucideIcon } from "lucide-react";

type StatItemProps = {
    label: string;
    value: string;
    suffix?: string;
    icon: LucideIcon;
};

export function StatItem({
    label,
    value,
    suffix,
    icon: Icon,
}: StatItemProps) {
    const isCoffeeStat = label === "Coffees Consumed";

    return (
        <div
            className="
                group
                px-4
                py-5
                sm:px-4
            "
        >
            {/* Label */}
            <p
                className="
                    flex
                    items-center
                    gap-1.5
                    font-mono
                    text-[12px]
                    uppercase
                    tracking-[0.08em]
                    text-(--graphite)
                    transition-colors
                    duration-150
                    group-hover:text-(--accent-strong)
                "
            >
                <Icon
                    size={15}
                    strokeWidth={1.8}
                    className="
                        text-(--graphite)
                        transition-colors
                        duration-150
                        group-hover:text-[#059669]
                    "
                />

                {label}
            </p>

            {/* Value */}
            <p
                className={`
                    mt-2
                    flex
                    items-baseline
                    gap-2
                    font-display
                    text-[25px]
                    leading-none
                    sm:text-[27px]
                    transition-colors
                    duration-150
                    ${
                        isCoffeeStat
                            ? "text-(--accent-strong) group-hover:text-(--ink)"
                            : "text-(--ink)"
                    }
                `}
            >
                <span>{value}</span>
                {suffix && (
                    <span
                        className="
                            text-[19px]
                            font-normal
                            text-(--accent-strong)
                        "
                    >
                        {suffix}
                    </span>
                )}
            </p>
        </div>
    );
}