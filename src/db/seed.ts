/**
 * Seed the dev environment from the existing mock data so the studio lands on
 * real, persisted rows. Idempotent: safe to re-run.
 *
 *   bun run db:seed
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  channelConfigs,
  channels,
  competitors,
  creditAccounts,
  creditTransactions,
  users,
  type GateMode,
  type StageKey,
} from "@/db/schema";
import { env } from "@/env";
import { CHANNELS } from "@/lib/studio";
import { COMPETITORS } from "@/lib/onboarding";
import { DEV_USER } from "@/server/constants";

/** Default per-channel gates: human approves every stage (clear HITL demo). */
const DEFAULT_GATES: Record<StageKey, GateMode> = {
  research: "manual",
  script: "manual",
  materials: "manual",
  storyboard: "manual",
  production: "manual",
  cuts: "manual",
  distribution: "manual",
};

async function seed() {
  console.log("→ seeding dev user");
  await db
    .insert(users)
    .values({ id: DEV_USER.id, email: DEV_USER.email, name: DEV_USER.name, image: DEV_USER.image })
    .onConflictDoNothing();

  console.log("→ seeding credit account");
  const existingAccount = await db.query.creditAccounts.findFirst({
    where: eq(creditAccounts.userId, DEV_USER.id),
  });
  if (!existingAccount) {
    const [account] = await db
      .insert(creditAccounts)
      .values({ userId: DEV_USER.id, balance: env.STARTING_CREDITS })
      .returning();
    await db.insert(creditTransactions).values({
      accountId: account.id,
      kind: "grant",
      amount: env.STARTING_CREDITS,
      balanceAfter: env.STARTING_CREDITS,
      note: "Initial dev grant",
    });
  }

  console.log(`→ seeding ${CHANNELS.length} channels + configs`);
  for (const c of CHANNELS) {
    await db
      .insert(channels)
      .values({
        id: c.id,
        userId: DEV_USER.id,
        name: c.name,
        handle: c.handle,
        niche: c.niche,
        image: c.image,
        subscribers: c.subscribers,
        grade: c.grade,
        joinedLabel: c.joinedLabel,
        meta: { thumbs: c.thumbs, videoTitles: c.videoTitles },
      })
      .onConflictDoNothing();

    await db
      .insert(channelConfigs)
      .values({
        channelId: c.id,
        voice: "calm",
        defaultFormats: ["long", "short"],
        gates: DEFAULT_GATES,
      })
      .onConflictDoNothing();
  }

  console.log(`→ seeding ${COMPETITORS.length} competitors`);
  for (const comp of COMPETITORS) {
    await db
      .insert(competitors)
      .values({
        id: comp.id,
        channelId: null,
        name: comp.name,
        handle: comp.handle,
        subscribers: comp.subscribers,
        avatar: comp.avatar,
        niche: comp.niche,
      })
      .onConflictDoNothing();
  }

  console.log("✓ seed complete");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ seed failed:", err);
    process.exit(1);
  });
