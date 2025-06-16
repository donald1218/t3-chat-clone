ALTER TABLE "preferences" ALTER COLUMN "name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "preferences" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "preferences" ALTER COLUMN "profession" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "preferences" ALTER COLUMN "custom_instructions" DROP NOT NULL;