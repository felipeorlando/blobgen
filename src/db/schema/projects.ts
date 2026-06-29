import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { channels } from "./channels";
import { users } from "./auth";
import {
  idCol,
  timestamps,
  type ProjectMode,
  type ProjectStatus,
  type StageKey,
} from "./_shared";

/**
 * A project = one idea moving through the pipeline. Columns map directly to the
 * inputs the New Idea composer already collects (prompt/mode/formats/...).
 */
export const projects = pgTable("projects", {
  id: idCol(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled project"),
  prompt: text("prompt").notNull(),
  mode: text("mode").$type<ProjectMode>().notNull().default("single"),
  // OutputFormat ids selected in the composer (e.g. ["long","short"]).
  formats: jsonb("formats").$type<string[]>().notNull().default([]),
  aspectRatio: text("aspect_ratio").notNull().default("9:16"),
  duration: text("duration").notNull().default("30s"),
  voice: text("voice").notNull().default("calm"),
  // OpenMontage pipeline id (creative format), e.g. "documentary_montage".
  pipeline: text("pipeline").notNull().default("documentary_montage"),
  status: text("status").$type<ProjectStatus>().notNull().default("Draft"),
  currentStageKey: text("current_stage_key").$type<StageKey>(),
  // eve session id driving this project's creative run (eve path only).
  eveSessionId: text("eve_session_id"),
  thumb: text("thumb").notNull().default(""),
  ...timestamps(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
