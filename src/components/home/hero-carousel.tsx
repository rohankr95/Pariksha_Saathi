"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";
import { SECTIONS, type SectionKey } from "@/lib/sections";

const SLIDE_KEYS: SectionKey[] = ["lectures", "notes", "career", "doubtClass"];
const AUTO_ADVANCE_MS = 5000;

const slides = SLIDE_KEYS.map((key) => SECTIONS.find((s) => s.key === key)!);

export function HeroCarousel() {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: `linear-gradient(135deg, var(${slide.colorVar}), var(--ps-ink-900))` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label={t("home.exploreTitle")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-white blur-3xl" />
      </div>

      <Link
        href={slide.href}
        className="relative mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:py-14"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {t("home.exploreTitle")}
        </p>
        <h2 className="font-sans text-2xl font-bold sm:text-3xl">
          {t(`sections.${slide.key}.title`)}
        </h2>
        <p className="max-w-md text-sm text-white/85 sm:text-base">
          {t(`sections.${slide.key}.desc`)}
        </p>
      </Link>

      <button
        type="button"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:flex"
        aria-label={t("common.previous")}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:flex"
        aria-label={t("common.next")}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="relative flex items-center justify-center gap-2 pb-5">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t(`sections.${s.key}.title`)}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
