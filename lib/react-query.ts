import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time for most data
      staleTime: 5 * 60 * 1000,
      // 10 minutes cache time
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Retry delay that backs off exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query key factory for consistent query keys
export const queryKeys = {
  // YellowBox queries
  yellowbox: {
    all: ['yellowbox'] as const,
    entries: () => [...queryKeys.yellowbox.all, 'entries'] as const,
    entry: (id: string) => [...queryKeys.yellowbox.entries(), id] as const,
    summary: (conversationHistory: unknown[], language: string) => 
      [...queryKeys.yellowbox.all, 'summary', { conversationHistory, language }] as const,
    quote: (entryId: string) => [...queryKeys.yellowbox.all, 'quote', entryId] as const,
  },
} as const;