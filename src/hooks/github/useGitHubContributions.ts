import { useQuery } from "@tanstack/react-query";

import {
    getGitHubContributions,
} from "@/services/github/github";

export function useAllGitHubContributions() {
    return useQuery({
        queryKey: [
            "github",
            "contributions",
        ],

        queryFn:
            getGitHubContributions,

        /*
         * GitHub activity is not second-to-second
         * data. Keep it fresh for 10 minutes.
         */
        staleTime:
            1000 * 60 * 10,

        /*
         * Keep the complete dataset in the
         * React Query cache for 30 minutes
         * after it is no longer being used.
         */
        gcTime:
            1000 * 60 * 30,

        /*
         * Don't create unnecessary requests when
         * the user returns to the browser window
         * or reconnects.
         */
        refetchOnWindowFocus:
            false,

        refetchOnReconnect:
            false,
    });
}