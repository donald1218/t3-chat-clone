import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const thread = pgTable("thread", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messages: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
