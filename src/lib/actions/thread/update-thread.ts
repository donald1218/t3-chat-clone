"use server";

import { db } from "@/db/drizzle";
import { Thread, threadTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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
