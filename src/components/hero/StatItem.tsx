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
    return (
        <div
            className="
                group
                relative
                px-4
                py-5
                transition-colors
                duration-150
                hover:bg-neutral-50
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
                    text-neutral-500
                    transition-colors
                    duration-150
                    group-hover:text-[#059669]
                "
            >
                <Icon
                    size={15}
                    strokeWidth={1.8}
                    className="
                        text-neutral-400
                        transition-colors
                        duration-150
                        group-hover:text-[#059669]
                    "
                />

                {label}
            </p>

            {/* Value */}
            <p
                className="
                    mt-2
                    font-display
                    text-[25px]
                    leading-none
                    text-neutral-950
                    sm:text-[27px]
                "
            >
                {value}
            </p>
        </div>
    );
}