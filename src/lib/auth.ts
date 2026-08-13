import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// Magic-link sign-in for all three roles (Teacher/Substitute/Admin), gated by the
// AllowedUser allowlist — see prisma/schema.prisma. Session strategy is "database"
// (the default for the Prisma adapter), so signing out anywhere revokes the session
// everywhere immediately, unlike JWT sessions.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL || "St. Francis Sub Portal <onboarding@resend.dev>",
    }),
  ],
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin/check-email",
  },
  callbacks: {
    // Reject sign-in for any email not on the allowlist, even though they'd
    // otherwise pass the magic-link check (they clicked a real link to their
    // own inbox) — this is what makes it an *approved*-user list.
    async signIn({ user }) {
      if (!user.email) return false;
      const allowed = await prisma.allowedUser.findUnique({ where: { email: user.email.toLowerCase() } });
      return Boolean(allowed);
    },
    async session({ session }) {
      if (session.user?.email) {
        const allowed = await prisma.allowedUser.findUnique({ where: { email: session.user.email.toLowerCase() } });
        session.user.role = allowed?.role ?? null;
      }
      return session;
    },
  },
});
