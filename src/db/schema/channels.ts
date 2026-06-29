import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { idCol, timestamps, type GateMode } from "./_shared";

/**
 * Channels mirror the UI `Channel` type in src/lib/studio.ts so a row casts
 * straight to it. `thumbs`/`videoTitles` live in `meta` to keep the surface flat.
 */
export const channels = pgTable("channels", {
  // Explicit id (seed reuses mock ids: stoic/ledger/cosmic/echo); app generates uuids.
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  niche: text("niche").notNull(),
  image: text("image").notNull(),
  subscribers: integer("subscribers").notNull().default(0),
  grade: text("grade").notNull().default("B"),
  joinedLabel: text("joined_label").notNull().default(""),
  youtubeChannelId: text("youtube_channel_id"),
  meta: jsonb("meta")
    .$type<{ thumbs?: string[]; videoTitles?: string[] }>()
    .notNull()
    .default({}),
  ...timestamps(),
});

/** Per-channel automation config; `gates` is the human-in-the-loop switch. */
export const channelConfigs = pgTable("channel_configs", {
  channelId: text("channel_id")
    .primaryKey()
    .references(() => channels.id, { onDelete: "cascade" }),
  voice: text("voice").notNull().default("calm"),
  defaultFormats: text("default_formats")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  autoMarketing: boolean("auto_marketing").notNull().default(false),
  brandVoice: text("brand_voice"),
  gates: jsonb("gates")
    .$type<Partial<Record<string, GateMode>>>()
    .notNull()
    .default({}),
  ...timestamps(),
});

/** Tracked competitors (mirrors the UI `Competitor` type). */
export const competitors = pgTable("competitors", {
  id: idCol(),
  channelId: text("channel_id").references(() => channels.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  subscribers: integer("subscribers").notNull().default(0),
  avatar: text("avatar").notNull().default(""),
  niche: text("niche").notNull().default("general"),
  ...timestamps(),
});

export type Channel = typeof channels.$inferSelect;
export type ChannelConfig = typeof channelConfigs.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
