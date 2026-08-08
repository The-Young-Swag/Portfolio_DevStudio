import type { LucideIcon } from "lucide-react";

type StatItemProps = {
    value: string;
    label: string;
    icon: LucideIcon;
};

export function StatItem({
    value,
    label,
    icon: Icon,
}: StatItemProps) {
    return (
        <div
            className="
                relative
                border-r
                border-neutral-200
                px-3
                py-5
                first:pl-0
                last:border-r-0
                sm:px-4
                sm:py-6
            "
        >
            <div className="text-2xl font-medium sm:text-3xl">
                {value}
            </div>

            <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-400">
                <Icon size={11} />
                {label}
            </div>
        </div>
    );
}