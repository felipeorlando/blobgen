import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { channels } from "./channels";
import { projects } from "./projects";
import { idCol, timestamps, type AssetKind } from "./_shared";

/** Lifecycle of a distribution record (lowercase; distinct from the UI UploadStatus). */
export type UploadState = "scheduled" | "published" | "processing" | "failed";

/** One publish/schedule of a project's asset to a platform (e.g. a YouTube upload). */
export const uploads = pgTable("uploads", {
  id: idCol(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  channelId: text("channel_id")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull().default("youtube"),
  kind: text("kind").$type<AssetKind>().notNull().default("Cuts"),
  externalId: text("external_id"),
  url: text("url"),
  title: text("title").notNull().default(""),
  thumb: text("thumb").notNull().default(""),
  status: text("status").$type<UploadState>().notNull().default("scheduled"),
  publishAt: timestamp("publish_at", { withTimezone: true, mode: "date" }),
  privacyStatus: text("privacy_status").notNull().default("private"),
  mock: boolean("mock").notNull().default(false),
  error: jsonb("error").$type<{ message: string } | null>(),
  ...timestamps(),
});

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
