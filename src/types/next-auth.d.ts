import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "STUDENT" | "TEACHER" | "SUPER_ADMIN";
    classLevel?: string | null;
    displayName?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "TEACHER" | "SUPER_ADMIN";
      classLevel: string | null;
      displayName: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "STUDENT" | "TEACHER" | "SUPER_ADMIN";
    classLevel?: string | null;
    displayName?: string | null;
  }
}
