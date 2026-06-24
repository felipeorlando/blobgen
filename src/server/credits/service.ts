/**
 * Credit ledger: append-only `credit_transactions` with a denormalized
 * `credit_accounts.balance`. Reserve holds estimated cost before a stage runs;
 * settle reconciles to actual; refund returns the hold on failure.
 */
import { desc, eq } from "drizzle-orm";
import { db, type DB } from "@/db";
import { creditAccounts, creditTransactions } from "@/db/schema";

export class InsufficientCredits extends Error {
  constructor(
    public readonly required: number,
    public readonly available: number,
  ) {
    super(`Insufficient credits: need ${required}, have ${available}.`);
    this.name = "InsufficientCredits";
  }
}

type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

type Link = { projectId?: string; stageRunId?: string };

async function getOrCreateAccount(userId: string) {
  const existing = await db.query.creditAccounts.findFirst({
    where: eq(creditAccounts.userId, userId),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(creditAccounts)
    .values({ userId, balance: 0 })
    .onConflictDoNothing()
    .returning();
  return (
    created ??
    (await db.query.creditAccounts.findFirst({
      where: eq(creditAccounts.userId, userId),
    }))!
  );
}

export async function getBalance(userId: string): Promise<number> {
  const account = await getOrCreateAccount(userId);
  return account.balance;
}

/** Lock the account row, mutate balance, append a ledger entry — atomically. */
async function applyDelta(
  tx: Tx,
  accountId: string,
  delta: number,
  kind: "grant" | "reserve" | "settle" | "refund",
  link: Link,
  note?: string,
): Promise<{ balanceAfter: number; txnId: string }> {
  const [account] = await tx
    .select()
    .from(creditAccounts)
    .where(eq(creditAccounts.id, accountId))
    .for("update");
  const balanceAfter = account.balance + delta;
  await tx
    .update(creditAccounts)
    .set({ balance: balanceAfter, updatedAt: new Date() })
    .where(eq(creditAccounts.id, accountId));
  const [txn] = await tx
    .insert(creditTransactions)
    .values({
      accountId,
      projectId: link.projectId ?? null,
      stageRunId: link.stageRunId ?? null,
      kind,
      amount: delta,
      balanceAfter,
      note: note ?? null,
    })
    .returning();
  return { balanceAfter, txnId: txn.id };
}

/** Grant credits (e.g. top-up). */
export async function grant(userId: string, amount: number, note?: string) {
  const account = await getOrCreateAccount(userId);
  return db.transaction((tx) =>
    applyDelta(tx, account.id, amount, "grant", {}, note),
  );
}

/** Hold `amount` before a stage runs. Throws InsufficientCredits if too low. */
export async function reserve(
  userId: string,
  amount: number,
  link: Link,
): Promise<{ txnId: string; balanceAfter: number }> {
  const account = await getOrCreateAccount(userId);
  return db.transaction(async (tx) => {
    const [locked] = await tx
      .select()
      .from(creditAccounts)
      .where(eq(creditAccounts.id, account.id))
      .for("update");
    if (locked.balance < amount) {
      throw new InsufficientCredits(amount, locked.balance);
    }
    return applyDelta(tx, account.id, -amount, "reserve", link, "Stage reserve");
  });
}

/** Reconcile a reservation to actual spend (delta = reserved − actual). */
export async function settle(
  userId: string,
  reserved: number,
  actual: number,
  link: Link,
) {
  const account = await getOrCreateAccount(userId);
  const delta = reserved - actual;
  if (delta === 0) return { balanceAfter: account.balance, txnId: null };
  return db.transaction((tx) =>
    applyDelta(tx, account.id, delta, "settle", link, "Stage settle"),
  );
}

/** Return a full reservation (stage failed before producing usage). */
export async function refund(userId: string, amount: number, link: Link) {
  if (amount <= 0) return;
  const account = await getOrCreateAccount(userId);
  return db.transaction((tx) =>
    applyDelta(tx, account.id, amount, "refund", link, "Stage refund"),
  );
}

export async function history(userId: string, limit = 50) {
  const account = await getOrCreateAccount(userId);
  return db.query.creditTransactions.findMany({
    where: eq(creditTransactions.accountId, account.id),
    orderBy: [desc(creditTransactions.createdAt)],
    limit,
  });
}
