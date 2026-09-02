import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

/**
 * Server-side guard for pages/server actions. Middleware already blocks
 * unauthenticated/unauthorised requests to /admin, but every server
 * component and server action must re-check — never trust the client.
 */
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!allowed.includes(session.user.role)) redirect("/");
  return session;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}
