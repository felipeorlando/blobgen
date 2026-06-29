import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { projects } from "./projects";
import { stageRuns } from "./pipeline";
import { idCol, timestamps, type CreditTxnKind } from "./_shared";

/** One balance per user; `balance` is a denormalized sum of the ledger. */
export const creditAccounts = pgTable("credit_accounts", {
  id: idCol(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  ...timestamps(),
});

/** Append-only ledger. amount is signed; reserve holds, settle adjusts, refund returns. */
export const creditTransactions = pgTable("credit_transactions", {
  id: idCol(),
  accountId: text("account_id")
    .notNull()
    .references(() => creditAccounts.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  stageRunId: text("stage_run_id").references(() => stageRuns.id, {
    onDelete: "set null",
  }),
  kind: text("kind").$type<CreditTxnKind>().notNull(),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  note: text("note"),
  ...timestamps(),
});

export type CreditAccount = typeof creditAccounts.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
