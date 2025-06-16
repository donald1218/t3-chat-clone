"use server";

import { asc, eq } from "drizzle-orm";

export async function listSpaces() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { db } = await import("@/db/drizzle");
  const { spaceTable } = await import("@/db/schema");

  // Fetch all spaces for the given user
  const spaces = await db
    .select()
    .from(spaceTable)
    .where(eq(spaceTable.userId, userId))
    .orderBy(asc(spaceTable.createdAt));

  return spaces;
}
