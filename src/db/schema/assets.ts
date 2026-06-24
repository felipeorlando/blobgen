import { boolean, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { stageRuns } from "./pipeline";
import {
  idCol,
  timestamps,
  type AssetKind,
  type ProjectStatus,
} from "./_shared";

/**
 * Every stage output is an asset. This table is the real source for the Library
 * view — a row maps onto the UI `LibraryItem`. Small structured outputs (brief,
 * script) live inline in `data`; large binaries live in `storageRef`.
 */
export const assets = pgTable("assets", {
  id: idCol(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  stageRunId: text("stage_run_id").references(() => stageRuns.id, {
    onDelete: "set null",
  }),
  kind: text("kind").$type<AssetKind>().notNull(),
  title: text("title").notNull().default(""),
  data: jsonb("data").$type<unknown>(),
  storageRef: text("storage_ref"),
  meta: jsonb("meta")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  visual: boolean("visual").notNull().default(false),
  status: text("status").$type<ProjectStatus>().notNull().default("Draft"),
  ...timestamps(),
});

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
