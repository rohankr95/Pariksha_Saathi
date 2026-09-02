"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { Emblem } from "@/components/layout/emblem";
import { useLocale } from "@/lib/i18n/locale-provider";

export function AdminSidebar({ role, className }: { role: Role; className?: string }) {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const items = ADMIN_NAV.filter((item) => item.roles.includes(role as "TEACHER" | "SUPER_ADMIN"));

  return (
    <nav className={cn("flex flex-col gap-1 overflow-y-auto p-3", className)} aria-label="Admin navigation">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2 py-1">
        <Emblem className="h-8 w-8" />
        <span className="font-sans text-sm font-bold text-primary">{t("admin.brandName")}</span>
      </Link>
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.slug}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-surface-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {locale === "hi" ? item.titleHi : item.titleEn}
          </Link>
        );
      })}
    </nav>
  );
}
