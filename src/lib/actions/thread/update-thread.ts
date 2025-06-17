"use server";

import { db } from "@/db/drizzle";
import { Thread, threadTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateThread({
  threadId,
  updates,
}: {
  threadId: string;
  updates: Partial<Thread>;
}) {
  if (!updates) return null;

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
