CREATE TABLE "usage" (
	"thread_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"token_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "usage_thread_message_idx" ON "usage" USING btree ("thread_id","message_id");