import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (used by middleware). No providers with Node-only
 * dependencies (bcrypt, Prisma) live here — those are added in `auth.ts`,
 * which runs only in the Node.js runtime (API routes / server actions).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        return role === "TEACHER" || role === "SUPER_ADMIN";
      }

      if (pathname.startsWith("/dashboard") || pathname.startsWith("/me")) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.classLevel = user.classLevel ?? null;
        token.displayName = user.displayName ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "STUDENT" | "TEACHER" | "SUPER_ADMIN";
        session.user.classLevel = (token.classLevel as string | null) ?? null;
        session.user.displayName = (token.displayName as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
