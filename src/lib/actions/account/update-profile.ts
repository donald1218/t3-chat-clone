"use server";

import { db } from "@/db/drizzle";
import { preferencesTable } from "@/db/schema";

export async function updateProfile(
  name?: string,
  userProfession?: string,
  customInstructions?: string
) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    return { success: false, message: "User not authenticated" };
  }
  const userId = user.data.user.id;

  await db
    .insert(preferencesTable)
    .values({
      userId,
      name,
      profession: userProfession,
      customInstructions,
    })
    .onConflictDoUpdate({
      target: preferencesTable.userId,
      set: {
        name,
        profession: userProfession,
        customInstructions,
      },
    });

  return { success: true, message: "Profile updated successfully" };
}
