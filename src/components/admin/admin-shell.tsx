"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { cn } from "@/lib/utils";

export const SIDEBAR_COOKIE = "ps_admin_sidebar";

/**
 * Admin frame: holds the desktop sidebar-collapsed state (remembered in a
 * cookie the server reads, so there's no first-paint flash) and the topbar's
 * toggle, letting an admin hide the sidebar for a wider working area. The
 * mobile drawer lives inside the topbar and is unaffected.
 */
export function AdminShell({
  role,
  name,
  initialCollapsed = false,
  children,
}: {
  role: Role;
  name: string;
  initialCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-1px)] max-w-7xl">
      <AdminSidebar
        role={role}
        className={cn("w-64 shrink-0 border-r border-border", collapsed ? "hidden" : "hidden lg:flex")}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={name} role={role} sidebarCollapsed={collapsed} onToggleSidebar={toggle} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
