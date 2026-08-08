export type ContributionPeriodId =
    | "last-12-months"
    | `${number}`;

export type ContributionPeriod = {
    id: ContributionPeriodId;
    label: string;
    year?: number;
};

export type ContributionDay = {
    date: string;
    count: number;
};