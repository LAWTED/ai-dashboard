import { useCallback } from 'react';
import { toast } from 'sonner';

export class YellowBoxError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'YellowBoxError';
  }
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  trackAnalytics?: boolean;
}

interface AnalyticsHook {
  trackError: () => void;
}

export function useYellowBoxErrorHandler(
  analytics?: AnalyticsHook | null
) {
  const handleError = useCallback(
    (error: Error | YellowBoxError, options: ErrorHandlerOptions = {}) => {
      const { showToast = true, trackAnalytics = true } = options;

      // Log error details
      if (error instanceof YellowBoxError) {
        console.error(`[YellowBox ${error.code}]:`, error.message, error.context);
      } else {
        console.error('[YellowBox Error]:', error);
      }

      // Track error in analytics
      if (trackAnalytics && analytics) {
        analytics.trackError();
      }

      // Show toast notification
      if (showToast) {
        const message = error instanceof YellowBoxError
          ? error.message
          : 'An unexpected error occurred';
        
        toast.error(message);
      }

      // Return the error for further handling if needed
      return error;
    },
    [analytics]
  );

  const createError = useCallback(
    (message: string, code: string, context?: Record<string, unknown>) => {
      return new YellowBoxError(message, code, context);
    },
    []
  );

  return { handleError, createError };
}