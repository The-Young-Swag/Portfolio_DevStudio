import type {
    GitHubContributionsResponse,
} from "@/components/github/types";

export async function getGitHubContributions(): Promise<GitHubContributionsResponse> {
    const response = await fetch(
        "/api/github/contributions",
        {
            method: "GET",
            headers: {
                Accept:
                    "application/json",
            },
        },
    );

    if (!response.ok) {
        const body =
            (await response
                .json()
                .catch(
                    () => null,
                )) as {
                error?: string;
            } | null;

        throw new Error(
            body?.error ??
                "Failed to load GitHub contributions.",
        );
    }

    return response.json();
}