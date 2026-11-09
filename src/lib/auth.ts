import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // On a session update (after a profile edit), refresh the token from the
    // database rather than from the update payload: a client can POST any
    // payload to the session endpoint, and displayName is written into other
    // records (e.g. story submissions).
    async jwt(params) {
      const token = authConfig.callbacks.jwt(params);
      if (params.trigger === "update" && token.sub) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { name: true, email: true, classLevel: true, displayName: true },
        });
        if (fresh) {
          token.name = fresh.name;
          token.email = fresh.email;
          token.classLevel = fresh.classLevel;
          token.displayName = fresh.displayName;
        }
      }
      return token;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          classLevel: user.classLevel,
          displayName: user.displayName,
        };
      },
    }),
  ],
});
