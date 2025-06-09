import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { type InferSelectModel } from "drizzle-orm";

export const threadTable = pgTable("thread", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default("New Thread"),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Thread = InferSelectModel<typeof threadTable>;

// Export all tables for use with drizzle-orm
export default {
  threadTable,
};
