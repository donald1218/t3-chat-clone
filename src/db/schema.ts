import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { type InferSelectModel } from "drizzle-orm";
import { BYOKConfig, LLMProvider, Message } from "@/lib/types";

export const spaceTable = pgTable(
  "space",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    name: text("name").notNull().default("Default Space"),
    prompt: text("prompt").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("space_user_idx").on(table.userId)]
);

export const threadTable = pgTable(
  "thread",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaceTable.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New Thread"),
    user: text("user"),
    messages: jsonb("messages").$type<Message[]>().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("thread_user_idx").on(table.user)]
);

export const preferencesTable = pgTable("preferences", {
  userId: text("user_id").primaryKey(),
  name: text("name").default(""),
  profession: text("profession").default(""),
  customInstructions: text("custom_instructions").default(""),
});

export const byokTable = pgTable("byok", {
  userId: text("user_id").primaryKey(),
  provider: text("provider").$type<LLMProvider>().notNull(),
  config: jsonb("config").$type<BYOKConfig>().notNull(),
});

export type Space = InferSelectModel<typeof spaceTable>;
export type Thread = InferSelectModel<typeof threadTable>;
export type Preferences = InferSelectModel<typeof preferencesTable>;
export type BYOK = InferSelectModel<typeof byokTable>;
