import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Card className="p-4">
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
        style={{ backgroundColor: `color-mix(in srgb, var(${color}) 15%, transparent)`, color: `var(${color})` }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-0.5 text-[11px] text-muted-foreground/80">{sublabel}</p>}
    </Card>
  );
}

export function StatGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}
