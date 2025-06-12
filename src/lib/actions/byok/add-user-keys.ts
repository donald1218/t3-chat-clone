"use server";

import { db } from "@/db/drizzle";
import { byokTable } from "@/db/schema";
import { BYOKConfig, LLMProvider } from "@/lib/types";
import { and, eq } from "drizzle-orm";

export async function addUserKey(
  userId: string,
  provider: LLMProvider,
  config: BYOKConfig
) {
  const [existingKeys] = await db
    .select()
    .from(byokTable)
    .where(and(eq(byokTable.userId, userId), eq(byokTable.provider, provider)));

  if (!existingKeys) {
    await db.insert(byokTable).values({ userId, provider, config });
  } else {
    await db
      .update(byokTable)
      .set({ config })
      .where(
        and(eq(byokTable.userId, userId), eq(byokTable.provider, provider))
      );
  }
}
