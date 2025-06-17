"use server";

import { db } from "@/db/drizzle";
import { usageTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getUsage(threadId: string, messageId: string) {
  const [usage] = await db
    .select()
    .from(usageTable)
    .where(
      and(
        eq(usageTable.threadId, threadId),
        eq(usageTable.messageId, messageId)
      )
    )
    .execute();

  return usage;
}
