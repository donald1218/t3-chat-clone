"use server";

import { db } from "@/db/drizzle";
import { threadTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function deleteThread(id: string, spaceId: string) {
  const [deletedThread] = await db
    .delete(threadTable)
    .where(and(eq(threadTable.id, id), eq(threadTable.spaceId, spaceId)))
    .returning();

  return deletedThread;
}
