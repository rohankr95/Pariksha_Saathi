"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MessageCircleQuestion } from "lucide-react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/i18n/locale-provider";

const CLASS_LABEL: Record<string, string> = {
  CLASS_9: "9",
  CLASS_10: "10",
  CLASS_11: "11",
  CLASS_12: "12",
};

export function Hero({ session }: { session: Session | null }) {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const firstName = session?.user?.displayName || session?.user?.name?.split(" ")[0];

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[var(--ps-indigo-700)] text-primary-foreground">
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-accent blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[var(--ps-violet-500)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-white/80"
        >
          {firstName
            ? t("home.greeting", { name: firstName })
            : t("home.greetingGuest")}
          {session?.user?.classLevel && (
            <span className="ml-2 rounded-full bg-white/15 px-2.5 py-0.5 text-xs">
              {t("home.classLabel", { class: CLASS_LABEL[session.user.classLevel] ?? "" })}
            </span>
          )}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-2 max-w-2xl font-sans text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
        >
          {t("site.tagline")}
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          onSubmit={onSearch}
          className="mt-6 flex max-w-xl gap-2"
          role="search"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.searchPlaceholder")}
              aria-label={t("home.searchPlaceholder")}
              className="bg-white pl-10 text-foreground"
            />
          </div>
          <Button type="submit" variant="accent" size="default">
            {t("common.language") === "English" ? "Search" : "खोजें"}
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Button asChild variant="accent" size="lg">
            <Link href="/lectures">{t("home.ctaStudy")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/40 bg-white/5 text-white hover:bg-white/15">
            <Link href="/doubt-class">
              <MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />
              {t("home.ctaDoubt")}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
