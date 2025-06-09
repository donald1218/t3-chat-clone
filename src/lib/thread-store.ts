import { create } from "zustand";
import {
  createThread,
  addMessageToThread,
  updateMessageInThread,
  removeMessageFromThread,
  clearThreadMessages,
  getThread,
} from "@/app/thread-actions";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ThreadState {
  threadId: string | null;
  isLoading: boolean;
  messages: Message[];
  addMessage: (role: MessageRole, content: string) => Promise<void>;
  updateMessage: (id: string, content: string) => Promise<void>;
  removeMessage: (id: string) => Promise<void>;
  clearThread: () => Promise<void>;
  initializeThread: () => Promise<void>;
}

/**
 * Thread store using Zustand with database persistence
 * Stores chat messages between user and assistant
 */
export const useThreadStore = create<ThreadState>()((set, get) => ({
  threadId: null,
  isLoading: false,
  messages: [],

  // Initialize or retrieve a thread
  initializeThread: async () => {
    // set({ isLoading: true });

    try {
      // Get the threadId from localStorage if available
      const storedThreadId = localStorage.getItem("current-thread-id");

      if (storedThreadId) {
        // Get existing thread from database
        const thread = await getThread(storedThreadId);
        if (thread) {
          set({
            threadId: thread.id,
            messages: thread.messages as Message[],
            isLoading: false,
          });
          return;
        }
      }

      // Create a new thread if no valid thread exists
      const newThread = await createThread();
      if (newThread) {
        localStorage.setItem("current-thread-id", newThread.id);
        set({
          threadId: newThread.id,
          messages: [],
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to initialize thread:", error);
      set({ isLoading: false });
    }
  },

  // Add a new message to the thread
  addMessage: async (role: MessageRole, content: string) => {
    const state = get();
    let threadId = state.threadId;

    // Initialize thread if not already done
    if (!threadId) {
      await state.initializeThread();
      threadId = get().threadId;
    }

    if (!threadId) {
      console.error("Unable to initialize thread");
      return;
    }

    // Optimistically update UI
    const tempId = crypto.randomUUID();
    const tempMessage = {
      id: tempId,
      role,
      content,
      timestamp: Date.now(),
    };

    set((state) => ({ messages: [...state.messages, tempMessage] }));

    try {
      // Persist to database
      const result = await addMessageToThread(threadId, role, content);

      if (result) {
        // Update with actual message from server if IDs don't match
        if (result.message.id !== tempId) {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === tempId ? result.message : msg
            ),
          }));
        }
      }
    } catch (error) {
      console.error("Failed to add message:", error);
      // Remove the temp message on error
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== tempId),
      }));
    }
  },

  // Update an existing message by ID
  updateMessage: async (id: string, content: string) => {
    const threadId = get().threadId;
    if (!threadId) return;

    // Optimistically update UI
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, content } : message
      ),
    }));

    try {
      // Persist to database
      await updateMessageInThread(threadId, id, content);
    } catch (error) {
      console.error("Failed to update message:", error);
      // Fetch fresh thread data on error
      const thread = await getThread(threadId);
      if (thread) {
        set({ messages: thread.messages as Message[] });
      }
    }
  },

  // Remove a message by ID
  removeMessage: async (id: string) => {
    const threadId = get().threadId;
    if (!threadId) return;

    // Optimistically update UI
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    }));

    try {
      // Persist to database
      await removeMessageFromThread(threadId, id);
    } catch (error) {
      console.error("Failed to remove message:", error);
      // Fetch fresh thread data on error
      const thread = await getThread(threadId);
      if (thread) {
        set({ messages: thread.messages as Message[] });
      }
    }
  },

  // Clear all messages
  clearThread: async () => {
    const threadId = get().threadId;
    if (!threadId) return;

    // Optimistically update UI
    set({ messages: [] });

    try {
      // Persist to database
      await clearThreadMessages(threadId);
    } catch (error) {
      console.error("Failed to clear thread:", error);
      // Fetch fresh thread data on error
      const thread = await getThread(threadId);
      if (thread) {
        set({ messages: thread.messages as Message[] });
      }
    }
  },
}));
