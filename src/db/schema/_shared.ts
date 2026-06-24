/**
 * Shared column helpers + the canonical domain vocabulary.
 *
 * These union types are the single source of truth for status/kind strings used
 * across the DB, pipeline engine, credits, and UI. They live in the db (leaf)
 * layer so every other layer can import them without creating cycles.
 */
import { text, timestamp } from "drizzle-orm/pg-core";

/** Text UUID primary key generated app-side (no pgcrypto extension needed). */
export const idCol = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

/** `created_at` / `updated_at` — spread into every table. */
export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/** Per-stage automation: human gate, deterministic advance, or AI-critic review. */
export type GateMode = "manual" | "auto" | "ai_review";

/** Ordered pipeline stages. Runtime order lives in the pipeline registry. */
export type StageKey =
  | "research"
  | "script"
  | "materials"
  | "storyboard"
  | "production"
  | "distribution";

/** stage_run status machine. */
export type StageStatus =
  | "pending"
  | "queued"
  | "running"
  | "awaiting_approval"
  | "approved"
  | "done"
  | "failed";

/** Mirrors the UI `ProjectStatus` (+ internal `Failed`). */
export type ProjectStatus =
  | "Draft"
  | "Rendering"
  | "Scheduled"
  | "Published"
  | "Failed";

export type ProjectMode = "single" | "series";

/** Asset kinds — kept as free text in the column to avoid enum migration churn. */
export type AssetKind =
  | "ResearchBrief"
  | "Script"
  | "Materials"
  | "Storyboard"
  | "Voiceover"
  | "Image"
  | "Video"
  | "Cuts"
  | "Thumbnail"
  | "Captions";

export type CreditTxnKind = "grant" | "reserve" | "settle" | "refund";
