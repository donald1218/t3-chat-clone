"use server";

import { db } from "@/db/drizzle";
import { spaceTable, threadTable } from "@/db/schema";
import { generateThreadTitle } from "@/lib/langchain";
import { defaultModel } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { Message, MessageRole } from "@/lib/types";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { processInput } from "./actions";

async function getLlmResponse(input: string, model: string): Promise<string> {
  try {
    const result = await processInput({
      inputField: input,
      model,
    });

    if (result.success) {
      return typeof result.llmResponse === "string"
        ? result.llmResponse
        : result.message || `Processed: ${input}`;
    } else {
      return `Error: ${result.error || "Unknown error"}`;
    }
  } catch (error) {
    console.error("Error processing input:", error);
    return "An unexpected error occurred";
  }
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
    role: "user" as MessageRole,
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

  const llmResponse = await getLlmResponse(
    space.prompt + firstMessage,
    model || defaultModel.id
  );
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
    role: "user" as MessageRole,
    content,
    timestamp: Date.now(),
    metadata,
  };

  const updatedMessages = [...messages, newMessage];

  const llmResponse = await getLlmResponse(
    space.prompt + updatedMessages.flatMap((msg) => msg.content).join(" "),
    model || defaultModel.id
  );

  const aiMessage: Message = {
    id: crypto.randomUUID(),
    role: "assistant" as MessageRole,
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
