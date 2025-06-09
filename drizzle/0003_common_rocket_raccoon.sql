ALTER TABLE "thread" ADD COLUMN "user" text;--> statement-breakpoint
CREATE INDEX "thread_user_idx" ON "thread" USING btree ("user");