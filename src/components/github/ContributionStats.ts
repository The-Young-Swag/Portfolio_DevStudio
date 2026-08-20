import type { ContributionCalendar } from "./types";

const WEEKDAY_NAMES = [
    "Sundays",
    "Mondays",
    "Tuesdays",
    "Wednesdays",
    "Thursdays",
    "Fridays",
    "Saturdays",
] as const;

export type ContributionStats = {
    mostActiveDay: string;
    leastActiveDay: string;
    weekdayTotals: Record<number, number>;
};

export function getContributionStats(
    calendar: ContributionCalendar,
): ContributionStats {
    const weekdayTotals: Record<number, number> = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
    };

    for (const week of calendar.weeks) {
        for (const day of week.days) {
            weekdayTotals[day.weekday] +=
                day.count;
        }
    }

    const weekdays = Object.keys(
        weekdayTotals,
    ).map(Number);

    const mostActiveDay = weekdays.reduce(
        (best, weekday) =>
            weekdayTotals[weekday] >
            weekdayTotals[best]
                ? weekday
                : best,
        weekdays[0],
    );

    const leastActiveDay = weekdays.reduce(
        (least, weekday) =>
            weekdayTotals[weekday] <
            weekdayTotals[least]
                ? weekday
                : least,
        weekdays[0],
    );

    return {
        mostActiveDay:
            WEEKDAY_NAMES[mostActiveDay],
        leastActiveDay:
            WEEKDAY_NAMES[leastActiveDay],
        weekdayTotals,
    };
}