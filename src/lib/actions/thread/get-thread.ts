"use server";

import { db } from "@/db/drizzle";
import { threadTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getThread(id: string) {
  const [thread] = await db
    .select()
    .from(threadTable)
    .where(eq(threadTable.id, id));

  return thread;
}
