import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
  color,
  href,
  linkLabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  linkLabel?: string;
}) {
  const body = (
    <Card className={href ? "h-full p-4 transition-shadow group-hover:shadow-[var(--shadow-card-hover)]" : "p-4"}>
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
        style={{ backgroundColor: `color-mix(in srgb, var(${color}) 15%, transparent)`, color: `var(${color})` }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-0.5 text-[11px] text-muted-foreground/80">{sublabel}</p>}
      {href && linkLabel && (
        <p className="mt-2 flex items-center gap-0.5 text-[11px] font-medium text-primary">
          {linkLabel} <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </p>
      )}
    </Card>
  );
  return href ? (
    <Link href={href} className="group block rounded-[var(--radius-lg)]">
      {body}
    </Link>
  ) : (
    body
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
