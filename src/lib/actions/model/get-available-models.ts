"use server";

import { db } from "@/db/drizzle";
import { byokTable } from "@/db/schema";
import { availableModels, ModelType } from "@/lib/models";
import { eq } from "drizzle-orm";

export async function getAvailableModels() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("User not authenticated");
  }
  const userId = user.data.user.id;
  if (!userId) {
    throw new Error("User ID not found");
  }

  const userKeys = await db
    .select()
    .from(byokTable)
    .where(eq(byokTable.userId, userId));

  const enableProviders = new Map<ModelType["provider"], boolean>([
    ["google", process.env.GOOGLE_API_KEY ? true : false],
    ["openai", process.env.OPENAI_API_KEY ? true : false],
    ["anthropic", process.env.ANTHROPIC_API_KEY ? true : false],
    ["openrouter", process.env.OPENROUTER_API_KEY ? true : false],
  ]);

  userKeys.forEach((key) => {
    if (key.provider && enableProviders.has(key.provider)) {
      enableProviders.set(key.provider, true);
    }
  });

  return availableModels.filter((model) => {
    const isEnabled = enableProviders.get(model.provider);
    if (isEnabled === undefined) {
      console.warn(`Provider ${model.provider} is not recognized`);
      return false;
    }
    return isEnabled;
  });
}
