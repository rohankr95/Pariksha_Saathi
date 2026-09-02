"use client";

import { Megaphone } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";

type Announcement = { id: string; textHi: string; textEn: string | null; link: string | null };

export function NoticeBanner({ announcements }: { announcements: Announcement[] }) {
  const { locale } = useLocale();
  if (announcements.length === 0) return null;

  const text = (a: Announcement) => (locale === "en" ? a.textEn || a.textHi : a.textHi);

  return (
    <div className="overflow-hidden border-y border-border bg-accent/10">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
          सूचना
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap text-sm text-foreground motion-reduce:animate-none">
            {[...announcements, ...announcements].map((a, i) => (
              <span key={`${a.id}-${i}`} className="mr-10">
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
