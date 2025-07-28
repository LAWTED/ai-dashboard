import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/react-query';
import { 
  yellowboxApi, 
  type DiaryRequest, 
  type SummaryRequest, 
  type SaveEntriesRequest, 
  type QuoteRequest,
  type YellowboxEntry 
} from '@/lib/api/yellowbox';

// Query hooks
export function useYellowboxEntries() {
  return useQuery({
    queryKey: queryKeys.yellowbox.entries(),
    queryFn: yellowboxApi.getEntries,
    staleTime: 2 * 60 * 1000, // 2 minutes - entries don't change frequently
  });
}

export function useYellowboxEntry(id: string) {
  return useQuery({
    queryKey: queryKeys.yellowbox.entry(id),
    queryFn: () => yellowboxApi.getEntry(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - individual entries are more stable
  });
}

// Mutation hooks
export function useDiaryResponse() {
  return useMutation({
    mutationFn: yellowboxApi.getDiaryResponse,
    onError: (error) => {
      console.error('Diary response error:', error);
      toast.error('Failed to get AI response');
    },
  });
}

export function useGenerateSummary() {
  return useMutation({
    mutationFn: yellowboxApi.generateSummary,
    onError: (error) => {
      console.error('Summary generation error:', error);
      toast.error('Failed to generate summary');
    },
  });
}

export function useSaveEntries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: yellowboxApi.saveEntries,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate entries cache to refetch updated data
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.yellowbox.entries() 
        });
        toast.success('Entries saved successfully!');
      } else {
        toast.error('Failed to save entries');
      }
    },
    onError: (error) => {
      console.error('Save entries error:', error);
      toast.error('Failed to save entries');
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => yellowboxApi.deleteEntry(id),
    onSuccess: (_, id) => {
      // Remove deleted entry from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.yellowbox.entry(id) 
      });
      
      // Update entries list cache
      queryClient.setQueryData<YellowboxEntry[]>(
        queryKeys.yellowbox.entries(),
        (oldData) => oldData?.filter(entry => entry.id !== id)
      );
      
      toast.success('Entry deleted successfully');
    },
    onError: (error) => {
      console.error('Delete entry error:', error);
      toast.error('Failed to delete entry');
    },
  });
}

export function useGenerateQuote() {
  return useMutation({
    mutationFn: yellowboxApi.generateQuote,
    onError: (error) => {
      console.error('Quote generation error:', error);
      toast.error('Failed to generate quote');
    },
  });
}

// Optimistic update hooks for better UX
export function useOptimisticEntries() {
  const queryClient = useQueryClient();
  
  const addOptimisticEntry = (newEntry: Partial<YellowboxEntry>) => {
    const optimisticEntry = {
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...newEntry,
    } as YellowboxEntry;
    
    queryClient.setQueryData<YellowboxEntry[]>(
      queryKeys.yellowbox.entries(),
      (oldData) => [optimisticEntry, ...(oldData || [])]
    );
    
    return optimisticEntry.id;
  };
  
  const removeOptimisticEntry = (tempId: string) => {
    queryClient.setQueryData<YellowboxEntry[]>(
      queryKeys.yellowbox.entries(),
      (oldData) => oldData?.filter(entry => entry.id !== tempId)
    );
  };
  
  return { addOptimisticEntry, removeOptimisticEntry };
}

// Prefetch hooks for better performance
export function usePrefetchYellowboxData() {
  const queryClient = useQueryClient();
  
  const prefetchEntries = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.yellowbox.entries(),
      queryFn: yellowboxApi.getEntries,
      staleTime: 2 * 60 * 1000,
    });
  };
  
  const prefetchEntry = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.yellowbox.entry(id),
      queryFn: () => yellowboxApi.getEntry(id),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  return { prefetchEntries, prefetchEntry };
}