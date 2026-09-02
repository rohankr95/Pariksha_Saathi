"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlayCircle, Lightbulb, MessageCircleQuestion, User } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "nav.home", href: "/", icon: Home },
  { key: "nav.lectures", href: "/lectures", icon: PlayCircle },
  { key: "nav.quiz", href: "/quiz", icon: Lightbulb },
  { key: "nav.doubtClass", href: "/doubt-class", icon: MessageCircleQuestion },
  { key: "nav.profile", href: "/dashboard", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden"
      aria-label="Bottom navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-6 w-6 min-h-[24px] min-w-[24px]" aria-hidden="true" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
