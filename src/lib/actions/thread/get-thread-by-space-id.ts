"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { threadTable } from "@/db/schema";

export async function getThreadsBySpaceId(spaceId: string) {
  const threads = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.spaceId, spaceId))
    .orderBy(desc(threadTable.updatedAt));
  return threads;
}
