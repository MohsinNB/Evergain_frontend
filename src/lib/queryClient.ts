import { QueryClient } from '@tanstack/react-query';
import type { AppError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        const status = (error as AppError | undefined)?.status ?? 0;
        // Don't retry client errors (validation, auth, not found)
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
