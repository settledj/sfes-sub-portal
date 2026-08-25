import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { AllowedRole } from "@prisma/client";

// Google is the primary sign-in method (covers Workspace staff and any sub with
// a personal Gmail account); Credentials (username/password) is the fallback for
// subs without a Google account. The Credentials provider requires JWT sessions
// — it has no adapter-linked account to persist a database session against —
// so the whole app uses JWT strategy. The Prisma adapter is still wired up so
// Google sign-ins get a linked User/Account record.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // allowDangerousEmailAccountLinking: our own AllowedUser allowlist is the
    // real security boundary here (see the signIn callback below), not
    // Auth.js's cross-provider account-linking safety check — without this,
    // someone who'd previously signed in via a different method (or a stale
    // dev-testing account) gets a confusing "OAuthAccountNotLinked" error
    // instead of just signing in.
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const allowed = await prisma.allowedUser.findUnique({ where: { email } });
        if (!allowed?.passwordHash) return null;

        const valid = await bcrypt.compare(password, allowed.passwordHash);
        if (!valid) return null;

        return { id: allowed.id, email: allowed.email };
      },
    }),
  ],
  pages: {
    signIn: "/stfrancishouston/signin",
    error: "/stfrancishouston/signin",
  },
  callbacks: {
    // Reject sign-in for any email not on the allowlist — this is what makes
    // it an *approved*-user list rather than "anyone with a Google account."
    async signIn({ user }) {
      if (!user.email) return false;
      const allowed = await prisma.allowedUser.findUnique({ where: { email: user.email.toLowerCase() } });
      return Boolean(allowed);
    },
    // Runs on sign-in (user is set) and on subsequent token refreshes (user is
    // undefined then) — only re-look-up the role on sign-in itself; a role
    // change via Admin > Access takes effect next time the person signs in.
    async jwt({ token, user }) {
      if (user?.email) {
        const allowed = await prisma.allowedUser.findUnique({ where: { email: user.email.toLowerCase() } });
        token.email = user.email;
        token.role = allowed?.role ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      session.user.role = (token.role as AllowedRole | null | undefined) ?? null;
      return session;
    },
  },
});
