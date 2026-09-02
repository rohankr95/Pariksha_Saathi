"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Users, PlayCircle, MessageCircleQuestion, Lightbulb } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-provider";

function useCountUp(target: number, active: boolean, durationMs = 1200) {
  const [prefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || prefersReducedMotion) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, durationMs, prefersReducedMotion]);

  return prefersReducedMotion && active ? target : value;
}

export function LiveCounters({
  stats,
}: {
  stats: { students: number; lectures: number; doubtsResolved: number; quizAttempts: number };
}) {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const items = [
    { icon: Users, label: t("home.statsStudents"), value: stats.students },
    { icon: PlayCircle, label: t("home.statsLectures"), value: stats.lectures },
    { icon: MessageCircleQuestion, label: t("home.statsDoubts"), value: stats.doubtsResolved },
    { icon: Lightbulb, label: t("home.statsQuizzes"), value: stats.quizAttempts },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item) => (
        <CounterCard key={item.label} {...item} active={inView} />
      ))}
    </div>
  );
}

function CounterCard({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  active: boolean;
}) {
  const count = useCountUp(value, active);
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-center shadow-[var(--shadow-card)]">
      <Icon className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
      <p className="mt-2 font-sans text-2xl font-bold tabular-nums text-foreground">
        {count.toLocaleString("en-IN")}
        {value > 0 && count === value ? "+" : ""}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
