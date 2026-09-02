"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Search, LogOut } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Emblem } from "@/components/layout/emblem";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function SiteHeader({ session }: { session: Session | null }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const navLinks: { key: string; href: string }[] = [
    { key: "nav.lectures", href: "/lectures" },
    { key: "nav.notes", href: "/notes" },
    { key: "nav.quiz", href: "/quiz" },
    { key: "nav.doubtClass", href: "/doubt-class" },
    { key: "nav.leaderboard", href: "/leaderboard" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface">
      {/* Slim official identity band */}
      <div className="border-b border-border bg-surface-muted px-4 py-1.5 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <span>{t("site.district")} · छत्तीसगढ़ शासन</span>
          <Link href="/help" className="hidden sm:inline hover:text-foreground">
            {t("footer.helpline")}: {process.env.NEXT_PUBLIC_HELPLINE_NUMBER ?? "1800-XXX-XXXX"}
          </Link>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Emblem className="h-10 w-10" />
          <div className="leading-tight">
            <p className="font-sans text-lg font-bold text-primary">{t("site.name")}</p>
            <p className="hidden text-[11px] text-muted-foreground sm:block">{t("site.tagline")}</p>
          </div>
        </Link>

        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-surface-muted hover:text-foreground"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="hidden rounded-full p-2 hover:bg-surface-muted sm:inline-flex"
            aria-label={t("home.searchPlaceholder")}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {session?.user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href={session.user.role === "STUDENT" ? "/dashboard" : "/admin"}
                className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium hover:bg-surface-muted"
              >
                {session.user.displayName || session.user.name}
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          <button
            className="rounded-[var(--radius-sm)] p-2 hover:bg-surface-muted lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "grid overflow-hidden border-t border-border transition-all duration-200 lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium hover:bg-surface-muted"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {session?.user ? (
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                {t("nav.logout")}
              </Button>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/register">{t("nav.register")}</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
