import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [GitHub],
  trustHost: true,
  callbacks: {
    async signIn({ profile }) {
      const allowed = process.env.AUTH_GITHUB_ALLOWED_USERNAME?.trim().toLowerCase();
      const login = (profile as { login?: unknown } | undefined)?.login;
      return Boolean(allowed && typeof login === "string" && login.toLowerCase() === allowed);
    },
    async jwt({ token, profile }) {
      if (profile) {
        const ghProfile = profile as { login?: string };
        if (ghProfile.login) {
          token.username = ghProfile.login;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.username) {
        session.user.name = token.username as string;
      }
      return session;
    },
  },
});
