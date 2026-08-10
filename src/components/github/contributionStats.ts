import type { ContributionCalendar } from "./types";

const WEEKDAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
] as const;

export function getWeekdayActivity(
    calendar: ContributionCalendar,
) {
    const totals = Array.from(
        { length: 7 },
        () => 0,
    );

    for (const week of calendar.weeks) {
        for (const day of week.days) {
            totals[day.weekday - 1] += day.count;
        }
    }

    const mostActiveIndex = totals.indexOf(
        Math.max(...totals),
    );

    const leastActiveIndex = totals.indexOf(
        Math.min(...totals),
    );

    return {
        mostActive: {
            weekday: WEEKDAY_NAMES[mostActiveIndex],
            contributions: totals[mostActiveIndex],
        },

        leastActive: {
            weekday: WEEKDAY_NAMES[leastActiveIndex],
            contributions: totals[leastActiveIndex],
        },
    };
}