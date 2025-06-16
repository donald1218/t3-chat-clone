CREATE TABLE "space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'Default Space' NOT NULL,
	"prompt" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "thread" ADD COLUMN "space_id" uuid NOT NULL;--> statement-breakpoint
CREATE INDEX "space_user_idx" ON "space" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "thread" ADD CONSTRAINT "thread_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;