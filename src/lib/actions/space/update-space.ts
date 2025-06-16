"use server";

export async function updateSpace(
  spaceId: string,
  name: string,
  prompt?: string
) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { db } = await import("@/db/drizzle");
  const { spaceTable } = await import("@/db/schema");
  const { and, eq } = await import("drizzle-orm");

  // Update the space in the database
  const [updatedSpace] = await db
    .update(spaceTable)
    .set({
      name: name,
      prompt: prompt, // Set prompt to null if not provided
      updatedAt: new Date(),
    })
    .where(and(eq(spaceTable.id, spaceId), eq(spaceTable.userId, userId)))
    .returning();
  if (!updatedSpace) {
    throw new Error("Space not found or you do not have access to it");
  }
  return updatedSpace;
}
