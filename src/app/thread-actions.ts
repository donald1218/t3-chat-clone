"use server";

import { db } from "@/db/drizzle";
import { spaceTable, Thread, threadTable } from "@/db/schema";
import { generateThreadTitle, getLLMResponse } from "@/lib/langchain";
import { defaultModel } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { Message, MessageRole } from "@/lib/types";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createThreadWithoutInput(spaceId: string) {
  const supabase = await createClient();
  const { data: authUserData } = await supabase.auth.getUser();
  const userId = authUserData.user?.id ?? "Guest";

  const [space] = await db
    .select()
    .from(spaceTable)
    .where(eq(spaceTable.id, spaceId))
    .limit(1);
  if (!space) {
    throw new Error("Space not found");
  }

  const [thread] = await db
    .insert(threadTable)
    .values({
      spaceId,
      messages: [],
      user: userId,
    })
    .returning();

  return thread;
}

/**
 * Create a new empty thread in the database
 */
export async function createThread(
  spaceId: string,
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
    role: "human",
    content: firstMessage,
    timestamp: Date.now(),
    metadata: {},
  };

  const [space] = await db
    .select()
    .from(spaceTable)
    .where(eq(spaceTable.id, spaceId))
    .limit(1);
  if (!space) {
    throw new Error("Space not found");
  }

  const llmResponse = await getLLMResponse([
    ["system", space.prompt],
    ["human", firstMessage],
  ]);

  const aiMessage: Message = {
    id: crypto.randomUUID(),
    role: "ai",
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
      spaceId,
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

export async function deleteThread(id: string, spaceId: string) {
  const [deletedThread] = await db
    .delete(threadTable)
    .where(and(eq(threadTable.id, id), eq(threadTable.spaceId, spaceId)))
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

export async function addUserMessageToThread(
  threadId: string,
  content: string,
  model?: string,
  metadata?: { [key: string]: unknown }
) {
  const [thread] = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.id, threadId));
  if (!thread) {
    throw new Error("Thread not found");
  }

  const [space] = await db
    .select()
    .from(spaceTable)
    .where(eq(spaceTable.id, thread.spaceId))
    .limit(1);
  if (!space) {
    throw new Error("Space not found");
  }

  const messages = thread.messages as Message[];
  const newMessage: Message = {
    id: crypto.randomUUID(),
    role: "human",
    content,
    timestamp: Date.now(),
    metadata,
  };

  const updatedMessages = [...messages, newMessage];

  const context = updatedMessages.map(
    (msg) => [msg.role, msg.content] satisfies [MessageRole, string]
  );

  const llmResponse = await getLLMResponse(
    [["system", space.prompt], ...context, ["human", content]],
    model || defaultModel.id
  );

  const aiMessage: Message = {
    id: crypto.randomUUID(),
    role: "ai",
    content: llmResponse,
    timestamp: Date.now(),
    metadata: {
      model: model || defaultModel.id,
    },
  };
  updatedMessages.push(aiMessage);

  const [updatedThread] = await db
    .update(threadTable)
    .set({
      messages: updatedMessages,
      updatedAt: new Date(),
    })
    .where(eq(threadTable.id, threadId))
    .returning();

  return { thread: updatedThread };
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

export async function getThreadsBySpaceId(spaceId: string) {
  const threads = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.spaceId, spaceId))
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

export async function updateThread(threadId: string, updates: Partial<Thread>) {
  const [updatedThread] = await db
    .update(threadTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(threadTable.id, threadId))
    .returning();

  return updatedThread;
}
