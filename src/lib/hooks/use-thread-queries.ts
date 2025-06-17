import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Thread } from "@/db/schema";
import { deleteThread } from "../actions/thread/delete-thread";
import { getThread } from "../actions/thread/get-thread";
import { listThreads } from "../actions/thread/list-threads";
import { getThreadsBySpaceId } from "../actions/thread/get-thread-by-space-id";
import { updateThread } from "../actions/thread/update-thread";

// Query keys for better type safety and organization
export const threadKeys = {
  all: ["threads"] as const,
  lists: () => [...threadKeys.all, "list"] as const,
  list: (filters: string) => [...threadKeys.lists(), { filters }] as const,
  details: () => [...threadKeys.all, "detail"] as const,
  detail: (id: string) => [...threadKeys.details(), id] as const,
};

export function prefetchThreadQueries(queryClient: QueryClient) {
  // Prefetch all threads
  queryClient.prefetchQuery({
    queryKey: threadKeys.lists(),
    queryFn: listThreads,
  });
}

export function useInvalidListThreadQuery(spaceId: string) {
  const queryClient = useQueryClient();

  return () => {
    // Invalidate the threads list query
    queryClient.invalidateQueries({
      queryKey: [threadKeys.lists(), spaceId],
    });
  };
}

// Hook to fetch all threads
export function useThreads(spaceId: string) {
  return useQuery({
    queryKey: [threadKeys.lists(), spaceId],
    queryFn: () => getThreadsBySpaceId(spaceId),
  });
}

export async function prefetchThreadQuery(
  queryClient: QueryClient,
  id: string
) {
  // Prefetch a single thread by ID
  await queryClient.prefetchQuery({
    queryKey: threadKeys.detail(id),
    queryFn: () => getThread(id),
  });
}

// Hook to fetch a single thread by ID
export function useThread(id: string | null) {
  return useQuery({
    queryKey: threadKeys.detail(id || ""),
    queryFn: () => (id ? getThread(id) : null),
    enabled: !!id, // Only run the query if we have an ID
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: threadKeys.lists(),
    mutationFn: ({ id, spaceId }: { id: string; spaceId: string }) =>
      deleteThread(id, spaceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [threadKeys.lists(), data.spaceId],
      });
    },

    // Optimistic update for better UX
    onMutate: async ({ id, spaceId }) => {
      // Cancel outgoing refetches for the threads list
      await queryClient.cancelQueries({
        queryKey: [threadKeys.lists(), spaceId],
      });

      // Get current threads data
      const previousThreads = queryClient.getQueryData<Thread[]>([
        threadKeys.lists(),
        spaceId,
      ]);

      if (previousThreads) {
        // Create an optimistic update
        const updatedThreads = previousThreads.filter(
          (thread) => thread.id !== id
        );

        // Update the cache with our optimistic value
        queryClient.setQueryData([threadKeys.lists(), spaceId], updatedThreads);

        // Return context with the previous threads data
        return { previousThreads };
      }

      return { previousThreads: null };
    },

    // If error, roll back to previous state
    onError: (err, { spaceId }, context) => {
      if (context?.previousThreads) {
        queryClient.setQueryData(
          [threadKeys.lists(), spaceId],
          context.previousThreads
        );
      }
    },

    // Always refetch the threads list after mutation
    onSettled: (data) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: [threadKeys.lists(), data.spaceId],
      });
    },
  });
}

export function useUpdateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: threadKeys.lists(),
    mutationFn: updateThread,

    // Optimistic update for better UX
    onMutate: async ({ threadId, updates }) => {
      // Cancel outgoing refetches for the threads list
      await queryClient.cancelQueries({
        queryKey: [threadKeys.lists(), updates.spaceId],
      });

      // Get current thread data
      const previousThread = queryClient.getQueryData<Thread>(
        threadKeys.detail(threadId)
      );

      if (previousThread) {
        // Create an optimistic update
        const updatedThread = { ...previousThread, ...updates };

        // Update the cache with our optimistic value
        queryClient.setQueryData(threadKeys.detail(threadId), updatedThread);

        // Return context with the previous thread data
        return { previousThread };
      }

      return { previousThread: null };
    },

    // If error, roll back to previous state
    onError: (err, { threadId }, context) => {
      if (context?.previousThread) {
        queryClient.setQueryData(
          threadKeys.detail(threadId),
          context.previousThread
        );
      }
    },

    // Always refetch the thread after mutation
    onSettled: (data) => {
      if (!data) return;

      queryClient.invalidateQueries({
        queryKey: threadKeys.detail(data.id),
      });

      queryClient.invalidateQueries({
        queryKey: [threadKeys.lists(), data.spaceId],
      });
    },
  });
}
