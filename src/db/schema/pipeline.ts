import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import {
  idCol,
  timestamps,
  type StageKey,
  type StageStatus,
} from "./_shared";

/** One run of one stage for one project — the durable status machine. */
export const stageRuns = pgTable(
  "stage_runs",
  {
    id: idCol(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    stageKey: text("stage_key").$type<StageKey>().notNull(),
    ord: integer("ord").notNull(),
    status: text("status").$type<StageStatus>().notNull().default("pending"),
    attempt: integer("attempt").notNull().default(0),
    input: jsonb("input").$type<unknown>(),
    output: jsonb("output").$type<unknown>(),
    error: jsonb("error").$type<{ message: string; stack?: string } | null>(),
    estimatedCredits: integer("estimated_credits").notNull().default(0),
    actualCredits: integer("actual_credits").notNull().default(0),
    creditTxnId: text("credit_txn_id"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (t) => [unique("stage_runs_project_stage_uq").on(t.projectId, t.stageKey)],
);

export type StageRun = typeof stageRuns.$inferSelect;
export type NewStageRun = typeof stageRuns.$inferInsert;
