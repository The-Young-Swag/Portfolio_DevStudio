export type ContributionPeriodId =
    | "last-12-months"
    | `${number}`;

export type ContributionPeriod = {
    id: ContributionPeriodId;
    label: string;
    year?: number;
};

export type ContributionLevel =
    | 0
    | 1
    | 2
    | 3
    | 4;

    export type ContributionDay = {
        date: string;
        count: number;
        level: ContributionLevel;
        weekday: number;
    };

export type ContributionWeek = {
    days: ContributionDay[];
};

export type ContributionCalendar = {
    totalContributions: number;
    weeks: ContributionWeek[];
};

export type GitHubContributionsResponse = {
    calendar: ContributionCalendar;
    availableYears: number[];
};