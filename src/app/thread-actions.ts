"use server";

import { db } from "@/db/drizzle";
import { threadTable } from "@/db/schema";
import { generateThreadTitle } from "@/lib/langchain";
import { createClient } from "@/lib/supabase/server";
import { Message, MessageRole } from "@/lib/thread-store";
import { eq } from "drizzle-orm";

/**
 * Create a new empty thread in the database
 */
export async function createThread() {
  const supabase = await createClient();
  const { data: authUserData } = await supabase.auth.getUser();
  const userId = authUserData.user?.id ?? "Guest";

  const [thread] = await db
    .insert(threadTable)
    .values({
      title: "New Thread",
      messages: [],
      user: userId,
    })
    .returning();

  return thread;
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
  const newMessage: Message = {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
  };

  const updatedMessages = [...messages, newMessage];

  if (updatedMessages.length == 2) {
    // Generate title based on first user message and first assistant response
    console.log("generating thread title");
    const title = await generateThreadTitle(newMessage.content);

    console.log("generated thread title:", title);
    await updateThreadTitle(threadId, title.toString());
  }

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
    .orderBy(threadTable.updatedAt);
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
