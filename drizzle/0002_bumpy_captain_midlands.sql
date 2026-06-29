CREATE TABLE "media_bank" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"kind" text DEFAULT 'image' NOT NULL,
	"storage_ref" text NOT NULL,
	"thumb_ref" text,
	"source" text DEFAULT 'stock' NOT NULL,
	"provider" text,
	"query" text,
	"prompt" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"width" integer,
	"height" integer,
	"duration_sec" integer,
	"license" text,
	"favorite" boolean DEFAULT false NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "pipeline" text DEFAULT 'documentary_montage' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "eve_session_id" text;--> statement-breakpoint
ALTER TABLE "media_bank" ADD CONSTRAINT "media_bank_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_bank" ADD CONSTRAINT "media_bank_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;