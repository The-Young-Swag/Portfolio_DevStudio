import type {
    GitHubContributionsResponse,
} from "@/components/github/types";

export async function getGitHubContributions(signal?: AbortSignal): Promise<GitHubContributionsResponse> {
    const response = await fetch(
        "/api/github/contributions",
        {
            method: "GET",
            headers: {
                Accept:
                    "application/json",
            },
            signal,
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