"use server";

import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { preferencesTable } from "@/db/schema";

export async function getProfile() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  const userId = user.data.user.id;
  const profile = await db
    .select()
    .from(preferencesTable)
    .where(eq(preferencesTable.userId, userId))
    .limit(1)
    .then((profile) => profile[0]);

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
}
