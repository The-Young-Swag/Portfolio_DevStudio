import { CalendarDays, Coffee, GitCommit } from "lucide-react";

import { StatCard } from "./StatItem";

export function HeroStats() {
    return (
        <div className="mt-10 border-t border-neutral-200">
            <div className="grid grid-cols-3">
                <StatCard
                    value="--"
                    label="Experience"
                    icon={CalendarDays}
                />

                <StatCard
                    value="--"
                    label="Commits / Yr"
                    icon={GitCommit}
                />

                <StatCard
                    value="YES"
                    label="Coffees Consumed"
                    icon={Coffee}
                />
            </div>
        </div>
    );
}