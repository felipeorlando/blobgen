import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { channels } from "./channels";
import { users } from "./auth";
import { idCol, timestamps } from "./_shared";

/** What a bank item is. Images first; the same table serves video/audio later. */
export type MediaBankKind = "image" | "video" | "audio";
/** Where a bank item came from. */
export type MediaBankSource = "stock" | "generated" | "uploaded";

/**
 * The Image Bank — a persistent, reusable, per-brand media library. The pipeline
 * draws from here FIRST (reuse = brand consistency + 0 generation credits) and
 * saves new stock/generated assets back so the channel's library compounds.
 * OpenMontage has no concept of this; it's a blobgen productization feature.
 */
export const mediaBank = pgTable("media_bank", {
  id: idCol(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  kind: text("kind").$type<MediaBankKind>().notNull().default("image"),
  /** Blob storage ref (served via /api/storage/[...ref]). */
  storageRef: text("storage_ref").notNull(),
  thumbRef: text("thumb_ref"),
  source: text("source").$type<MediaBankSource>().notNull().default("stock"),
  provider: text("provider"),
  /** The stock query or generation prompt that produced this item. */
  query: text("query"),
  prompt: text("prompt"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  width: integer("width"),
  height: integer("height"),
  durationSec: integer("duration_sec"),
  license: text("license"),
  favorite: boolean("favorite").notNull().default(false),
  useCount: integer("use_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "date" }),
  ...timestamps(),
});

export type MediaBankItem = typeof mediaBank.$inferSelect;
export type NewMediaBankItem = typeof mediaBank.$inferInsert;
