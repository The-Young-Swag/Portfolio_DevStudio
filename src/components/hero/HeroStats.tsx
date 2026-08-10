import {
    CalendarDays,
    GitCommit,
    Coffee,
} from "lucide-react";

import {
    useGitHubContributions,
} from "@/hooks/github/useGitHubContributions";

import { StatItem } from "./StatItem";
import { AlsoTrue } from "./AlsoTrue";

export function HeroStats() {
    const { data } =
        useGitHubContributions(
            "last-12-months",
        );

    const now = new Date();

    const currentYear =
        now.getFullYear();

    const startOfYear =
        new Date(currentYear, 0, 1);

    const yearProgress =
        (now.getTime() -
            startOfYear.getTime()) /
        (new Date(
            currentYear + 1,
            0,
            1,
        ).getTime() -
            startOfYear.getTime());

    const currentYearDecimal =
        currentYear + yearProgress;

    const earliestGitHubYear =
        data?.availableYears.length
            ? Math.min(
                  ...data.availableYears,
              )
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
        data?.calendar.totalContributions;

    return (
        <div className="mt-10 border-t hairline">
            <div className="grid grid-cols-3">
                <div className="border-r hairline">
                    <StatItem
                        label="Experience"
                        value={experience}
                        suffix="yrs"
                        icon={CalendarDays}
                    />
                </div>

                <div className="border-r hairline">
                    <StatItem
                        label="Contributions / Year"
                        value={
                            contributions !==
                            undefined
                                ? contributions.toLocaleString()
                                : "—"
                        }
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