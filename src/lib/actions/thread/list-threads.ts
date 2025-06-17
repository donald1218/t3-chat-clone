"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { threadTable } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

/**
 * Get all threads
 */
export async function listThreads() {
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
