import { requireRole } from "@/lib/require-role";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-1px)] max-w-7xl">
      <AdminSidebar role={session.user.role} className="hidden w-64 shrink-0 border-r border-border lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={session.user.displayName || session.user.name || ""} role={session.user.role} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
