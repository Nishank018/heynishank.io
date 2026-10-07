import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

const database = getDb();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(database
    ? {
        adapter: DrizzleAdapter(database, {
          usersTable: users,
          accountsTable: accounts,
          sessionsTable: sessions,
          verificationTokensTable: verificationTokens,
        }),
      }
    : {}),
  providers: [GitHub],
  trustHost: true,
  callbacks: {
    async signIn({ profile }) {
      const allowed = process.env.AUTH_GITHUB_ALLOWED_USERNAME?.trim().toLowerCase();
      const login = (profile as { login?: unknown } | undefined)?.login;
      return Boolean(allowed && typeof login === "string" && login.toLowerCase() === allowed);
    },
  },
});
