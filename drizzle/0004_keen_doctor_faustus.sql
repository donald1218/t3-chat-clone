CREATE TABLE "byok" (
	"user_id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"config" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"profession" text DEFAULT '' NOT NULL,
	"custom_instructions" text DEFAULT '' NOT NULL
);
