const GITHUB_GRAPHQL_URL =
    "https://api.github.com/graphql";

const CONTRIBUTIONS_QUERY = `
    query Contributions(
        $login: String!
        $from: DateTime!
        $to: DateTime!
    ) {
    user(login: $login) {
    contributionsCollection(
        from: $from
        to: $to
    ) {
        contributionCalendar {
            totalContributions
            weeks {
                contributionDays {
                    contributionCount
                    contributionLevel
                    date
                }
            }
        }
    }
}
    }
`;

type GitHubResponse = {
    data?: {
        user: {
            contributionsCollection: {
                contributionCalendar: {
                    totalContributions: number;
                    weeks: {
                        contributionDays: {
                            contributionCount: number;
                            contributionLevel:
                                | "NONE"
                                | "FIRST_QUARTILE"
                                | "SECOND_QUARTILE"
                                | "THIRD_QUARTILE"
                                | "FOURTH_QUARTILE";
                            date: string;
                        }[];
                    }[];
                };
            };
        } | null;
    };
    errors?: {
        message: string;
    }[];
};

function getDateRange(period: string) {
    const now = new Date();

    if (period === "last-12-months") {
        const to = now;
        const from = new Date(now);

        from.setFullYear(
            from.getFullYear() - 1,
        );

        return { from, to };
    }

    const year = Number(period);

    if (!Number.isInteger(year)) {
        throw new Error("Invalid contribution period.");
    }

    return {
        from: new Date(
            Date.UTC(year, 0, 1),
        ),
        to: new Date(
            Date.UTC(year + 1, 0, 1),
        ),
    };
}

export async function GET(request: Request) {
    const token = process.env.GITHUB_TOKEN;
    const username = process.env.GITHUB_USERNAME;

    if (!token || !username) {
        return Response.json(
            {
                error: "GitHub API configuration is missing.",
            },
            {
                status: 500,
            },
        );
    }

    const url = new URL(request.url);

    const period =
        url.searchParams.get("period") ??
        "last-12-months";

    try {
        const { from, to } =
            getDateRange(period);

        const response = await fetch(
            GITHUB_GRAPHQL_URL,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    query: CONTRIBUTIONS_QUERY,
                    variables: {
                        login: username,
                        from: from.toISOString(),
                        to: to.toISOString(),
                    },
                }),
            },
        );

        if (!response.ok) {
            return Response.json(
                {
                    error:
                        "GitHub API request failed.",
                },
                {
                    status: response.status,
                },
            );
        }

        const result =
            (await response.json()) as GitHubResponse;

        if (
            result.errors?.length ||
            !result.data?.user
        ) {
            return Response.json(
                {
                    error:
                        result.errors?.[0]?.message ??
                        "GitHub user not found.",
                },
                {
                    status: 502,
                },
            );
        }

        const calendar =
            result.data.user
                .contributionsCollection
                .contributionCalendar;
            
        const availableYears = [
            ...new Set(
                calendar.weeks.flatMap((week) =>
                    week.contributionDays.map(
                        (day) =>
                            new Date(day.date).getUTCFullYear(),
                    ),
                ),
            ),
        ].sort((a, b) => b - a);
        return Response.json({
            calendar: {
                totalContributions:
                    calendar.totalContributions,
        
                weeks: calendar.weeks.map(
                    (week) => ({
                        days:
                            week.contributionDays.map(
                                (day) => ({
                                    date: day.date,
                                    count:
                                        day.contributionCount,
                                    level:
                                        getLevel(
                                            day.contributionLevel,
                                        ),
                                }),
                            ),
                    }),
                ),
            },
        
            availableYears,
        });
        
    } catch (error) {
        console.error(
            "GitHub contributions error:",
            error,
        );

        return Response.json(
            {
                error:
                    "Unable to retrieve GitHub contributions.",
            },
            {
                status: 500,
            },
        );
    }
}

function getLevel(
    level:
        | "NONE"
        | "FIRST_QUARTILE"
        | "SECOND_QUARTILE"
        | "THIRD_QUARTILE"
        | "FOURTH_QUARTILE",
): 0 | 1 | 2 | 3 | 4 {
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