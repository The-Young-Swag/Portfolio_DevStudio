import { useQuery } from "@tanstack/react-query";

import type {
    ContributionPeriodId,
} from "@/components/github/types";

import {
    getGitHubContributions,
} from "@/services/github/github";

export function useGitHubContributions(
    period: ContributionPeriodId,
) {
    return useQuery({
        queryKey: [
            "github",
            "contributions",
            period,
        ],

        queryFn: () =>
            getGitHubContributions(period),

        staleTime: 1000 * 60 * 10,
    });
}