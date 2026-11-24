import type { PropsWithChildren } from "react";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

import { ThemeProvider } from "@/context/theme";
import { ApiError } from "@/services/api";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 10,
            gcTime: 1000 * 60 * 30,
            retry: (failureCount, error) => {
                if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                    return false;
                }

                return failureCount < 1;
            },
            retryDelay: 500,
            refetchOnWindowFocus: false,
        },
    },
});

type AppProvidersProps = PropsWithChildren;

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
    );
}