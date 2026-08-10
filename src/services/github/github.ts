import type {
    ContributionPeriodId,
    GitHubContributionsResponse,
} from "@/components/github/types";

export async function getGitHubContributions(
    period: ContributionPeriodId,
): Promise<GitHubContributionsResponse> {
    const response = await fetch(
        `/api/github/contributions?period=${encodeURIComponent(
            period,
        )}`,
    );

    if (!response.ok) {
        const body = (await response
            .json()
            .catch(() => null)) as {
            error?: string;
        } | null;

        throw new Error(
            body?.error ??
                "Failed to load GitHub contributions.",
        );
    }

    return response.json();
}