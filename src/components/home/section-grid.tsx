"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SECTIONS } from "@/lib/sections";
import { useLocale } from "@/lib/i18n/locale-provider";

export function SectionGrid() {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {SECTIONS.map((section, i) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
          >
            <Link
              href={section.href}
              className="group flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)]"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${section.colorVar}) 15%, transparent)`,
                  color: `var(${section.colorVar})`,
                }}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-sans text-sm font-semibold text-foreground sm:text-base">
                  {t(`sections.${section.key}.title`)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {t(`sections.${section.key}.desc`)}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
