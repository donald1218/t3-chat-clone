"use server";

import { db } from "@/db/drizzle";
import { threadTable } from "@/db/schema";
import { UIMessage } from "ai";

export async function createThread(spaceId: string, message: UIMessage) {
  const [thread] = await db
    .insert(threadTable)
    .values({
      spaceId,
      messages: [message],
    })
    .returning();

  if (!thread) {
    throw new Error("Failed to create thread");
  }

  return thread;
}
