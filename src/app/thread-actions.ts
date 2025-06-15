"use server";

import { db } from "@/db/drizzle";
import { threadTable } from "@/db/schema";
import { generateThreadTitle } from "@/lib/langchain";
import { defaultModel } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { Message, MessageRole } from "@/lib/types";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { processInput } from "./actions";

/**
 * Create a new empty thread in the database
 */
export async function createThread(
  firstMessage: string,
  model?: string,
  options?: {
    redirectAfterCreate: boolean;
  }
) {
  const supabase = await createClient();
  const { data: authUserData } = await supabase.auth.getUser();
  const userId = authUserData.user?.id ?? "Guest";
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: "user" as MessageRole,
    content: firstMessage,
    timestamp: Date.now(),
    metadata: {},
  };

  let llmResponse = "";
  try {
    const result = await processInput({
      inputField: firstMessage,
      model: model || "gemma-3n-e4b-it",
    });

    if (result.success) {
      // Get the LLM response text
      llmResponse =
        typeof result.llmResponse === "string"
          ? result.llmResponse
          : result.message || `Processed: ${firstMessage}`;
    } else {
      // Handle error case
      const errorMsg = result.error || "Unknown error";
      llmResponse = `Error: ${errorMsg}`;
    }
  } catch {
    llmResponse = "An unexpected error occurred";
  }

  const aiMessage: Message = {
    id: crypto.randomUUID(),
    role: "assistant" as MessageRole,
    content: llmResponse,
    timestamp: Date.now(),
    metadata: {
      model: model || defaultModel.id,
    },
  };

  // Generate title based on first user message and first assistant response
  const title = await generateThreadTitle(firstMessage + " " + llmResponse);

  const [thread] = await db
    .insert(threadTable)
    .values({
      title: title.toString(),
      messages: [userMessage, aiMessage],
      user: userId,
    })
    .returning();

  if (options?.redirectAfterCreate) {
    // Redirect to the new thread page
    const threadUrl = `/thread/${thread.id}`;

    return redirect(threadUrl);
  }

  return thread;
}

export async function deleteThread(id: string) {
  const [deletedThread] = await db
    .delete(threadTable)
    .where(eq(threadTable.id, id))
    .returning();

  return deletedThread;
}

/**
 * Get a thread by its ID
 */
export async function getThread(id: string) {
  const [thread] = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.id, id));

  return thread;
}

/**
 * Add a message to a thread
 */
export async function addMessageToThread(
  threadId: string,
  role: MessageRole,
  content: string,
  metadata?: { [key: string]: unknown }
) {
  const [thread] = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.id, threadId));

  if (!thread) {
    return null;
  }

  const messages = thread.messages as Message[];
  const newMessage: Message = {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
    metadata,
  };

  const updatedMessages = [...messages, newMessage];

  const [updatedThread] = await db
    .update(threadTable)
    .set({
      messages: updatedMessages,
      updatedAt: new Date(),
    })
    .where(eq(threadTable.id, threadId))
    .returning();

  return { thread: updatedThread, message: newMessage };
}

/**
 * Update a message in a thread
 */
export async function updateMessageInThread(
  threadId: string,
  messageId: string,
  content: string
) {
  const [thread] = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.id, threadId));

  if (!thread) {
    return null;
  }

  const messages = thread.messages as Message[];
  const updatedMessages = messages.map((message) =>
    message.id === messageId ? { ...message, content } : message
  );

  const [updatedThread] = await db
    .update(threadTable)
    .set({
      messages: updatedMessages,
      updatedAt: new Date(),
    })
    .where(eq(threadTable.id, threadId))
    .returning();

  return updatedThread;
}

/**
 * Remove a message from a thread
 */
export async function removeMessageFromThread(
  threadId: string,
  messageId: string
) {
  const [thread] = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.id, threadId));

  if (!thread) {
    return null;
  }

  const messages = thread.messages as Message[];
  const updatedMessages = messages.filter(
    (message) => message.id !== messageId
  );

  const [updatedThread] = await db
    .update(threadTable)
    .set({
      messages: updatedMessages,
      updatedAt: new Date(),
    })
    .where(eq(threadTable.id, threadId))
    .returning();

  return updatedThread;
}

/**
 * Clear all messages from a thread
 */
export async function clearThreadMessages(threadId: string) {
  const [updatedThread] = await db
    .update(threadTable)
    .set({
      messages: [],
      updatedAt: new Date(),
    })
    .where(eq(threadTable.id, threadId))
    .returning();

  return updatedThread;
}

/**
 * Get all threads
 */
export async function getAllThreads() {
  const supabase = await createClient();
  const { data: authUserData } = await supabase.auth.getUser();
  const userId = authUserData.user?.id ?? "Guest";

  const threads = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.user, userId))
    .orderBy(desc(threadTable.updatedAt));
  return threads;
}

/**
 * Update the title of a thread
 */
export async function updateThreadTitle(threadId: string, title: string) {
  const [updatedThread] = await db
    .update(threadTable)
    .set({
      title,
      updatedAt: new Date(),
    })
    .where(eq(threadTable.id, threadId))
    .returning();

  return updatedThread;
}
