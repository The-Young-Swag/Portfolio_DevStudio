const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CONTRIBUTION_FIELDS = `
    contributionCalendar {
        totalContributions
        weeks {
            contributionDays {
                contributionCount
                contributionLevel
                date
                weekday
            }
        }
    }
`;

const YEARS_QUERY = `
    query ContributionYears($login: String!) {
        user(login: $login) {
            contributionsCollection {
                contributionYears
            }
        }
    }
`;

type ContributionLevel =
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";

type GitHubYearsResponse = {
    data?: {
        user: {
            contributionsCollection: {
                contributionYears: number[];
            };
        } | null;
    };
    errors?: {
        message: string;
    }[];
};

type GitHubCalendar = {
    totalContributions: number;
    weeks: {
        contributionDays: {
            contributionCount: number;
            contributionLevel: ContributionLevel;
            date: string;
            weekday: number;
        }[];
    }[];
};

type GitHubCalendarResponse = {
    data?: {
        user: Record<string, { contributionCalendar: GitHubCalendar } | null>;
    };
    errors?: {
        message: string;
        path?: (string | number)[];
    }[];
};

function getDateRange(period: string) {
    const now = new Date();

    if (period === "last-12-months") {
        const to = now;
        const from = new Date(now);

        from.setFullYear(from.getFullYear() - 1);

        return { from, to };
    }

    const year = Number(period);

    if (!Number.isInteger(year)) {
        throw new Error("Invalid contribution period.");
    }

    return {
        from: new Date(Date.UTC(year, 0, 1)),
        to: new Date(Date.UTC(year + 1, 0, 1)),
    };
}

function getLevel(level: ContributionLevel): 0 | 1 | 2 | 3 | 4 {
    switch (level) {
        case "FIRST_QUARTILE":
            return 1;
        case "SECOND_QUARTILE":
            return 2;
        case "THIRD_QUARTILE":
            return 3;
        case "FOURTH_QUARTILE":
            return 4;
        default:
            return 0;
    }
}

function normalizeCalendar(calendar: GitHubCalendar) {
    if (!calendar || !Array.isArray(calendar.weeks)) {
        throw new Error("GitHub contribution calendar is missing weeks.");
    }

    return {
        totalContributions: calendar.totalContributions,

        weeks: calendar.weeks.map((week) => {
            if (!Array.isArray(week.contributionDays)) {
                throw new Error(
                    "GitHub contribution week is missing contributionDays.",
                );
            }

            return {
                days: week.contributionDays.map((day) => ({
                    date: day.date,
                    count: day.contributionCount,
                    level: getLevel(day.contributionLevel),
                    weekday: day.weekday,
                })),
            };
        }),
    };
}

function createAlias(period: string) {
    if (period === "last-12-months") {
        return "last12Months";
    }

    return `year${period}`;
}

function createCalendarQuery(periods: string[]) {
    const selections = periods
        .map((period) => {
            const alias = createAlias(period);
            const { from, to } = getDateRange(period);

            return `
                ${alias}: contributionsCollection(
                    from: "${from.toISOString()}"
                    to: "${to.toISOString()}"
                ) {
                    ${CONTRIBUTION_FIELDS}
                }
            `;
        })
        .join("\n");

    return `
        query AllContributionCalendars($login: String!) {
            user(login: $login) {
                ${selections}
            }
        }
    `;
}

export async function GET() {
    const token = process.env.GITHUB_TOKEN;
    const username = process.env.GITHUB_USERNAME;

    if (!token || !username) {
        return Response.json(
            { error: "GitHub API configuration is missing." },
            { status: 500 },
        );
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    try {
        const yearsResponse = await fetch(GITHUB_GRAPHQL_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
                query: YEARS_QUERY,
                variables: { login: username },
            }),
        });

        if (!yearsResponse.ok) {
            return Response.json(
                { error: "GitHub API request failed." },
                { status: yearsResponse.status },
            );
        }

        const yearsResult =
            (await yearsResponse.json()) as GitHubYearsResponse;

        if (yearsResult.errors?.length || !yearsResult.data?.user) {
            return Response.json(
                {
                    error:
                        yearsResult.errors?.[0]?.message ??
                        "GitHub user not found.",
                },
                { status: 502 },
            );
        }

        const availableYears =
            yearsResult.data.user.contributionsCollection.contributionYears;

        const sortedYears = [
            ...new Set(
                availableYears
                    .filter((year) => Number.isInteger(year))
                    .sort((a, b) => b - a),
            ),
        ];

        const periods = ["last-12-months", ...sortedYears.map(String)];

        const calendarsQuery = createCalendarQuery(periods);

        const calendarsResponse = await fetch(GITHUB_GRAPHQL_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
                query: calendarsQuery,
                variables: { login: username },
            }),
        });

        if (!calendarsResponse.ok) {
            return Response.json(
                { error: "GitHub API request failed." },
                { status: calendarsResponse.status },
            );
        }

        const calendarsResult =
            (await calendarsResponse.json()) as GitHubCalendarResponse;

        if (calendarsResult.errors?.length || !calendarsResult.data?.user) {
            const errorMessage =
                calendarsResult.errors
                    ?.map((error) => error.message)
                    ?.join("; ") ??
                "Unable to retrieve GitHub contributions.";

            return Response.json({ error: errorMessage }, { status: 502 });
        }

        const user = calendarsResult.data.user;

        const calendarsByPeriod = Object.fromEntries(
            periods.flatMap((period) => {
                const alias = createAlias(period);
                const entry = user[alias];

                if (!entry || !entry.contributionCalendar) {
                    return [];
                }

                return [
                    [period, normalizeCalendar(entry.contributionCalendar)],
                ];
            }),
        );

        if (Object.keys(calendarsByPeriod).length === 0) {
            return Response.json(
                { error: "Unable to retrieve GitHub contributions." },
                { status: 502 },
            );
        }

        return Response.json(
            {
                calendarsByPeriod,
                availableYears: sortedYears,
            },
            {
                headers: {
                    "Cache-Control":
                        "public, s-maxage=1800, stale-while-revalidate=3600",
                },
            },
        );
    } catch (error) {
        console.error("GitHub contributions error:", error);

        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to retrieve GitHub contributions.",
            },
            { status: 500 },
        );
    }
}