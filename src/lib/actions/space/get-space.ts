"use server";

export async function getSpace(spaceId: string) {
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

  // Fetch the space by ID and user ID
  const space = await db
    .select()
    .from(spaceTable)
    .where(and(eq(spaceTable.id, spaceId), eq(spaceTable.userId, userId)))
    .limit(1)
    .then((spaces) => spaces[0]);
  if (!space) {
    throw new Error("Space not found or you do not have access to it");
  }
  return space;
}
