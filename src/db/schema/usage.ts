import { integer, jsonb, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { stageRuns } from "./pipeline";
import { idCol, timestamps } from "./_shared";

/** Per-call provider usage — drives real credit settlement and cost tracking. */
export const apiUsage = pgTable("api_usage", {
  id: idCol(),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  stageRunId: text("stage_run_id").references(() => stageRuns.id, {
    onDelete: "set null",
  }),
  provider: text("provider").notNull(),
  model: text("model"),
  requestKind: text("request_kind"),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costUsd: numeric("cost_usd", { precision: 12, scale: 6 })
    .notNull()
    .default("0"),
  latencyMs: integer("latency_ms"),
  raw: jsonb("raw").$type<unknown>(),
  ...timestamps(),
});

export type ApiUsage = typeof apiUsage.$inferSelect;
export type NewApiUsage = typeof apiUsage.$inferInsert;
