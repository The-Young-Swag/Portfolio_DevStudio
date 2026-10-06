import {
    useAllGitHubContributions,
} from "@/hooks/github/useGitHubContributions";
import { useProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import type { HeroStat } from "@/services/profile/profile";

import { StatItem } from "./StatItem";
import { AlsoTrue } from "./AlsoTrue";
import { resolveStatIcon } from "./statIcons";

function resolveStatValue(stat: HeroStat, contributions: string): string {
    if (stat.live === "contributions") {
        return contributions;
    }

    return stat.value;
}

export function HeroStats() {
    const { data } = useAllGitHubContributions();
    const { profile } = useProfile();

    const contributions =
        data?.calendarsByPeriod["last-12-months"]?.totalContributions;

    const stats: HeroStat[] = profile.hero_stats ?? staticProfile.hero_stats;
    const contributionsValue =
        contributions !== undefined ? contributions.toLocaleString() : "—";

    return (
        <div className="mt-10 border-t hairline">
            {stats.length > 0 && (
                <div
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
                >
                    {stats.map((stat, index) => (
                        <div
                            key={`${stat.label}-${index}`}
                            className={index < stats.length - 1 ? "border-r hairline" : undefined}
                        >
                            <StatItem
                                label={stat.label}
                                value={resolveStatValue(stat, contributionsValue)}
                                suffix={stat.suffix === "" ? undefined : stat.suffix}
                                icon={resolveStatIcon(stat.icon)}
                            />
                        </div>
                    ))}
                </div>
            )}

            <AlsoTrue />
        </div>
    );
}