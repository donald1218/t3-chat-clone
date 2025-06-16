import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAllThreads,
  getThread,
  createThread,
  updateThreadTitle,
  deleteThread,
  addUserMessageToThread,
  getThreadsBySpaceId,
} from "@/app/thread-actions";
import { Message, MessageRole } from "@/lib/types";
import { Thread } from "@/db/schema";
import { defaultModel } from "../models";

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
    queryFn: getAllThreads,
  });
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

// Hook to create a new thread
export function useCreateThread() {
  const queryClient = useQueryClient();
  const queryKeyWithSpaceId = (spaceId: string) => [
    threadKeys.lists(),
    spaceId,
  ];

  return useMutation({
    mutationKey: threadKeys.lists(),
    mutationFn: ({
      spaceId,
      firstMessage,
    }: {
      spaceId: string;
      firstMessage: string;
    }) => createThread(spaceId, firstMessage),

    // When the mutation succeeds, invalidate the threads list query
    onSuccess: (newThread) => {
      queryClient.invalidateQueries({
        queryKey: queryKeyWithSpaceId(newThread.spaceId),
      });
      queryClient.invalidateQueries({
        queryKey: threadKeys.detail(newThread.id),
      });
      return newThread;
    },

    onMutate: async ({ spaceId, firstMessage }) => {
      // Cancel outgoing refetches for the threads list
      await queryClient.cancelQueries({
        queryKey: queryKeyWithSpaceId(spaceId),
      });

      // Get current threads data
      const previousThreads = queryClient.getQueryData<Thread[]>(
        threadKeys.lists()
      );

      // Create an optimistic update
      const newThread: Thread = {
        id: "",
        title: "",
        spaceId: spaceId,
        messages: [
          {
            id: crypto.randomUUID(),
            role: "user",
            content: firstMessage,
            timestamp: Date.now(),
            metadata: {},
          } as Message,
        ],
        user: "", // Replace with actual user ID if available
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update the cache with our optimistic value
      queryClient.setQueryData(queryKeyWithSpaceId(spaceId), [
        newThread,
        ...(previousThreads || []),
      ]);

      // Return context with the previous threads data
      return { previousThreads };
    },

    // If error, roll back to previous state
    onError: (err, variables, context) => {
      if (context?.previousThreads) {
        queryClient.setQueryData(
          queryKeyWithSpaceId(context.previousThreads[0].spaceId),
          context.previousThreads
        );
      }
    },

    // Always refetch the threads list after mutation
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeyWithSpaceId(data?.spaceId || ""),
      });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: threadKeys.lists(),
    mutationFn: (id: string) => deleteThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: threadKeys.lists(),
      });
    },

    // Optimistic update for better UX
    onMutate: async (id) => {
      // Cancel outgoing refetches for the threads list
      await queryClient.cancelQueries({
        queryKey: threadKeys.lists(),
      });

      // Get current threads data
      const previousThreads = queryClient.getQueryData<Thread[]>(
        threadKeys.lists()
      );

      if (previousThreads) {
        // Create an optimistic update
        const updatedThreads = previousThreads.filter(
          (thread) => thread.id !== id
        );

        // Update the cache with our optimistic value
        queryClient.setQueryData(threadKeys.lists(), updatedThreads);

        // Return context with the previous threads data
        return { previousThreads };
      }

      return { previousThreads: null };
    },

    // If error, roll back to previous state
    onError: (err, id, context) => {
      if (context?.previousThreads) {
        queryClient.setQueryData(threadKeys.lists(), context.previousThreads);
      }
    },

    // Always refetch the threads list after mutation
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: [threadKeys.lists(), data?.spaceId || ""],
      });
    },
  });
}

// Hook to add a message to a thread
export function useAddMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      content,
      model,
      metadata,
    }: {
      threadId: string;
      content: string;
      model?: string;
      metadata?: { [key: string]: unknown };
    }) => {
      const result = await addUserMessageToThread(
        threadId,
        content,
        model,
        metadata
      );

      return result;
    },
    // When the mutation succeeds, update the thread in the cache
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: threadKeys.detail(variables.threadId),
      });
      queryClient.invalidateQueries({
        queryKey: threadKeys.lists(),
      });
    },
    // Optimistic update for better UX
    onMutate: async ({ threadId, content, model }) => {
      // Cancel outgoing refetches for the thread
      await queryClient.cancelQueries({
        queryKey: threadKeys.detail(threadId),
      });

      // Get current thread data
      const previousThread = queryClient.getQueryData<Thread>(
        threadKeys.detail(threadId)
      );

      if (previousThread) {
        // Create an optimistic update
        const messages = [...(previousThread.messages as Message[])];
        const newMessage: Message = {
          id: crypto.randomUUID(),
          role: "user" as MessageRole,
          content,
          timestamp: Date.now(),
          metadata: {
            model: model || defaultModel.id,
          },
        };

        // Add the new message to the thread
        const updatedMessages = [...messages, newMessage];

        // Update the cache with our optimistic value
        queryClient.setQueryData(threadKeys.detail(threadId), {
          ...previousThread,
          messages: updatedMessages,
          updatedAt: new Date(),
        });

        // Return context with the previous thread data
        return { previousThread };
      }

      return { previousThread: null };
    },
    // If error, roll back to previous state
    onError: (err, variables, context) => {
      if (context?.previousThread) {
        queryClient.setQueryData(
          threadKeys.detail(variables.threadId),
          context.previousThread
        );
      }
    },
  });
}

// Hook to update thread title
export function useUpdateThreadTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      title,
    }: {
      threadId: string;
      title: string;
    }) => {
      return updateThreadTitle(threadId, title);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: threadKeys.detail(variables.threadId),
      });
      queryClient.invalidateQueries({
        queryKey: threadKeys.lists(),
      });
    },
  });
}
