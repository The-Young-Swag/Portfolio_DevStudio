import {
    CalendarDays,
    GitCommit,
    Coffee,
} from "lucide-react";

import { StatItem } from "./StatItem";
import { AlsoTrue } from "./AlsoTrue";

export function HeroStats() {
    return (
        <div className="mt-10 border-t border-neutral-200">
            <div className="grid grid-cols-3">
                <div className="border-r border-neutral-200">
                    <StatItem
                        label="Experience"
                        value="--"
                        icon={CalendarDays}
                    />
                </div>

                <div className="border-r border-neutral-200">
                    <StatItem
                        label="Commits / Year"
                        value="--"
                        icon={GitCommit}
                    />
                </div>

                <StatItem
                    label="Coffees Consumed"
                    value="YES."
                    icon={Coffee}
                />
            </div>

            <AlsoTrue />
        </div>
    );
}