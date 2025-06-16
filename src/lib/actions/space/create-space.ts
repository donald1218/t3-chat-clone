"use server";

export async function createSpace(spaceName: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { db } = await import("@/db/drizzle");
  const { spaceTable } = await import("@/db/schema");
  const { redirect } = await import("next/navigation");

  // Insert the new space into the database
  const [newSpace] = await db
    .insert(spaceTable)
    .values({
      name: spaceName,
      userId: userId,
    })
    .returning();

  // Redirect to the new space's page
  redirect(`/${newSpace.id}`);
}
