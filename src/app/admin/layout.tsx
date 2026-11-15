import { cookies } from "next/headers";
import { requireRole } from "@/lib/require-role";
import { AdminShell } from "@/components/admin/admin-shell";

// Must be the literal, not imported from admin-shell: that file is "use client",
// so a server import of its exports yields a client-reference proxy, not the string.
const SIDEBAR_COOKIE = "ps_admin_sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "1";

  return (
    <AdminShell
      role={session.user.role}
      name={session.user.displayName || session.user.name || ""}
      initialCollapsed={initialCollapsed}
    >
      {children}
    </AdminShell>
  );
}
