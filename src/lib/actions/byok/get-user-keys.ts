"use server";

import { db } from "@/db/drizzle";
import { byokTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserKeys(userId: string) {
  const keys = await db
    .select()
    .from(byokTable)
    .where(eq(byokTable.userId, userId));

  if (!keys) {
    return null;
  }

  return keys;
}
