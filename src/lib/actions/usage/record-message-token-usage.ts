"use server";

import { db } from "@/db/drizzle";
import { usageTable } from "@/db/schema";

export async function recordMessageTokenUsage(
  threadId: string,
  messageId: string,
  tokenNumber: number
) {
  const [usage] = await db
    .insert(usageTable)
    .values({
      threadId,
      messageId,
      tokenNumber,
    })
    .returning();

  return usage;
}
