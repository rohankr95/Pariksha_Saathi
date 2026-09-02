"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-provider";

export function SiteFooter() {
  const { t } = useLocale();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const lastUpdated = new Date().toLocaleDateString(
    typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-IN" : "hi-IN",
    { day: "2-digit", month: "long", year: "numeric" }
  );

  return (
    <footer className="mt-12 border-t border-border bg-surface-muted pb-20 pt-10 text-sm md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-sans text-base font-bold text-primary">{t("site.name")}</p>
          <p className="mt-2 text-muted-foreground">{t("site.department")}</p>
        </div>

        <div>
          <p className="font-semibold text-foreground">{t("footer.address")}</p>
          <p className="mt-2 text-muted-foreground">
            जिला शिक्षा कार्यालय, सूरजपुर, छत्तीसगढ़ – 497229
          </p>
          <p className="mt-1 text-muted-foreground">
            {t("footer.helpline")}: {process.env.NEXT_PUBLIC_HELPLINE_NUMBER ?? "1800-XXX-XXXX"}
          </p>
        </div>

        <div>
          <p className="font-semibold text-foreground">{t("footer.policies")}</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="hover:text-foreground">
                {t("footer.accessibility")}
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="hover:text-foreground">
                {t("footer.disclaimer")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-foreground">Follow</p>
          <p className="mt-2 text-muted-foreground">
            {t("footer.lastUpdated")}: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-border px-4 pt-4 text-xs text-muted-foreground">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}
