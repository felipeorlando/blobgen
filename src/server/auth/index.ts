import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import {
  accounts,
  creditAccounts,
  creditTransactions,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";
import { env } from "@/env";
import { DEV_USER } from "@/server/constants";

/** Ensure the dev user + a starting credit balance exist (login works without seeding). */
async function ensureDevUser() {
  await db
    .insert(users)
    .values({
      id: DEV_USER.id,
      email: DEV_USER.email,
      name: DEV_USER.name,
      image: DEV_USER.image,
    })
    .onConflictDoNothing();
  const account = await db.query.creditAccounts.findFirst({
    where: (a, { eq }) => eq(a.userId, DEV_USER.id),
  });
  if (!account) {
    const [created] = await db
      .insert(creditAccounts)
      .values({ userId: DEV_USER.id, balance: env.STARTING_CREDITS })
      .onConflictDoNothing()
      .returning();
    if (created) {
      await db.insert(creditTransactions).values({
        accountId: created.id,
        kind: "grant",
        amount: env.STARTING_CREDITS,
        balanceAfter: env.STARTING_CREDITS,
        note: "Initial dev grant",
      });
    }
  }
}

const googleConfigured = !!(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET || "dev-insecure-secret-change-me",
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID!,
            clientSecret: env.AUTH_GOOGLE_SECRET!,
            authorization: {
              params: {
                scope:
                  "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",
                // Needed for a refresh_token (server-side uploads after the access token expires).
                access_type: "offline",
                prompt: "consent",
              },
            },
          }),
        ]
      : []),
    ...(env.AUTH_DEV_LOGIN
      ? [
          Credentials({
            id: "dev",
            name: "Dev Login",
            credentials: {},
            async authorize() {
              await ensureDevUser();
              return {
                id: DEV_USER.id,
                email: DEV_USER.email,
                name: DEV_USER.name,
                image: DEV_USER.image,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});

export const isGoogleConfigured = googleConfigured;
export const isDevLoginEnabled = env.AUTH_DEV_LOGIN;
