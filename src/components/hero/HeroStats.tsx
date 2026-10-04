import {
    useAllGitHubContributions,
} from "@/hooks/github/useGitHubContributions";
import { useProfile } from "@/hooks/profile/useProfile";
import { profile as staticProfile } from "@/constants/profile";
import type { HeroStat } from "@/services/profile/profile";

import { StatItem } from "./StatItem";
import { AlsoTrue } from "./AlsoTrue";
import { resolveStatIcon } from "./statIcons";

function resolveStatValue(
    stat: HeroStat,
    experience: string,
    contributions: string,
): string {
    if (stat.live === "experience") {
        return experience;
    }

    if (stat.live === "contributions") {
        return contributions;
    }

    return stat.value;
}

export function HeroStats() {
    const { data } = useAllGitHubContributions();
    const { profile } = useProfile();

    const now = new Date();

    const currentYear = now.getFullYear();
    
    const startOfYear = new Date(
        currentYear,
        0,
        1,
    );
    
    const startOfNextYear = new Date(
        currentYear + 1,
        0,
        1,
    );
    
    const yearProgress =
        (now.getTime() - startOfYear.getTime()) /
        (startOfNextYear.getTime() -
            startOfYear.getTime());
    
    const currentYearDecimal =
        currentYear + yearProgress;
    
    const earliestGitHubYear =
        data?.availableYears.length
            ? Math.min(...data.availableYears)
            : undefined;
    
    const experienceYears =
        earliestGitHubYear !== undefined
            ? currentYearDecimal -
              earliestGitHubYear
            : undefined;
    
    const experience =
        experienceYears !== undefined
            ? experienceYears.toFixed(1)
            : "—";

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
                                value={resolveStatValue(stat, experience, contributionsValue)}
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