import type { LucideIcon } from "lucide-react";

type StatItemProps = {
    label: string;
    value: string;
    icon: LucideIcon;
};

export function StatItem({
    label,
    value,
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
                    text-[var(--graphite)]
                    transition-colors
                    duration-150
                    group-hover:text-[#059669]
                "
            >
                <Icon
                    size={15}
                    strokeWidth={1.8}
                    className="
                        text-[var(--graphite)]
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
                    font-display
                    text-[25px]
                    leading-none
                    sm:text-[27px]
                    transition-colors
                    duration-150
                    ${
                        isCoffeeStat
                            ? "text-[#059669] group-hover:text-neutral-950"
                            : "text-neutral-950"
                    }
                `}
            >
                {value}
            </p>
        </div>
    );
}