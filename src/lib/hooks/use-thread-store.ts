import {
  useThread,
  useAddMessage,
  useUpdateMessage,
  useRemoveMessage,
  useClearThread,
} from "./use-thread-queries";
import { Message, MessageRole } from "@/lib/types";
import { useMemo, useState, useEffect } from "react";

/**
 * Hook for managing the current thread using TanStack Query
 *
 * This replaces the previous Zustand implementation with a simpler React hooks approach
 *
 * @returns Thread data and mutation functions
 */
export function useCurrentThread(initialThreadId?: string | null) {
  // Local state to keep track of current thread ID
  const [threadId, setThreadId] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    // If initial thread ID is provided, use it
    if (initialThreadId) {
      setThreadId(initialThreadId);
      localStorage.setItem("current-thread-id", initialThreadId);
    } else {
      // Otherwise check if we have one in localStorage
      const storedThreadId = localStorage.getItem("current-thread-id");
      if (storedThreadId) {
        setThreadId(storedThreadId);
      }
    }
  }, [initialThreadId]);

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

  // Function to initialize or set a new thread ID
  const initializeThread = (id: string | null = null) => {
    if (id) {
      setThreadId(id);
      localStorage.setItem("current-thread-id", id);
    } else {
      const storedThreadId = localStorage.getItem("current-thread-id");
      if (storedThreadId) {
        setThreadId(storedThreadId);
      }
    }
  };

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
    setThreadId: initializeThread,
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
