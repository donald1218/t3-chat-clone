import { create } from "zustand";
import {
  useThread,
  useAddMessage,
  useUpdateMessage,
  useRemoveMessage,
  useClearThread,
} from "./use-thread-queries";
import { Message, MessageRole } from "@/lib/thread-store";
import { useMemo } from "react";

/**
 * Thread state without actions
 */
interface ThreadState {
  threadId: string | null;
  setThreadId: (id: string | null) => void;
  initializeThread: () => void;
}

/**
 * Local thread store that just manages the current thread ID
 * All data fetching and mutations are handled by TanStack Query
 */
export const useLocalThreadStore = create<ThreadState>()((set) => ({
  threadId: null,

  setThreadId: (id) => set({ threadId: id }),

  initializeThread: () => {
    const storedThreadId = localStorage.getItem("current-thread-id");
    if (storedThreadId) {
      set({ threadId: storedThreadId });
    }
  },
}));

/**
 * Hook that combines TanStack Query with Zustand for thread management
 *
 * @returns Thread data and mutation functions
 */
export function useCurrentThread() {
  // Get current thread ID from store
  const threadId = useLocalThreadStore((state) => state.threadId);
  const initializeThread = useLocalThreadStore(
    (state) => state.initializeThread
  );

  // Query for current thread data
  const { data: thread, isLoading, isError, error } = useThread(threadId);

  // Set up mutations
  const addMessageMutation = useAddMessage();
  const updateMessageMutation = useUpdateMessage();
  const removeMessageMutation = useRemoveMessage();
  const clearThreadMutation = useClearThread();

  // Extract messages from thread
  const messages = useMemo(() => {
    return (thread?.messages as Message[]) || [];
  }, [thread]);

  // Wrap mutations in simple function interfaces
  const addMessage = async (role: MessageRole, content: string) => {
    if (!threadId) return;

    await addMessageMutation.mutateAsync({
      threadId,
      role,
      content,
    });
  };

  const updateMessage = async (id: string, content: string) => {
    if (!threadId) return;

    await updateMessageMutation.mutateAsync({
      threadId,
      messageId: id,
      content,
    });
  };

  const removeMessage = async (id: string) => {
    if (!threadId) return;

    await removeMessageMutation.mutateAsync({
      threadId,
      messageId: id,
    });
  };

  const clearThread = async () => {
    if (!threadId) return;

    await clearThreadMutation.mutateAsync(threadId);
  };

  return {
    thread,
    threadId,
    messages,
    isLoading,
    isError,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    clearThread,
    initializeThread,
  };
}
