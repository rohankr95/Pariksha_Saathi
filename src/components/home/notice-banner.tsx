"use client";

import { Megaphone } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";

type Announcement = { id: string; textHi: string; textEn: string | null; link: string | null };

export function NoticeBanner({ announcements }: { announcements: Announcement[] }) {
  const { t, locale } = useLocale();
  if (announcements.length === 0) return null;

  const text = (a: Announcement) => (locale === "en" ? a.textEn || a.textHi : a.textHi);

  return (
    <div className="border-y-2 border-accent/40 bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-[var(--shadow-card)]">
          <Megaphone className="h-5 w-5 motion-safe:animate-pulse" aria-hidden="true" />
          {t("common.notice")}
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-[marquee_28s_linear_infinite] whitespace-nowrap text-base font-medium text-foreground motion-reduce:animate-none">
            {[...announcements, ...announcements].map((a, i) => (
              <span key={`${a.id}-${i}`} className="mr-12">
                {text(a)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
