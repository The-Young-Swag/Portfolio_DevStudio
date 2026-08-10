import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
          staleTime: 1000 * 60 * 10,
          gcTime: 1000 * 60 * 30,
          retry: 1,
          refetchOnWindowFocus: false,
      },
  },
});

type AppProvidersProps = PropsWithChildren;

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
      <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
  );
}