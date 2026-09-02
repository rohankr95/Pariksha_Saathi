"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import type { Role } from "@prisma/client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AdminTopbar({ name, role }: { name: string; role: Role }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="rounded-[var(--radius-sm)] p-2 hover:bg-surface-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold">{name}</span>
      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <LanguageToggle />
        </div>
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          aria-label="Logout"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          लॉगआउट
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72 max-w-[80vw] bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-3">
              <span className="text-sm font-semibold">मेनू</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-1.5 hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminSidebar role={role} />
          </div>
          <button
            className="flex-1 bg-black/40"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
