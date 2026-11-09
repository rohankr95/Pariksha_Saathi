import Link from "next/link";
import { cn } from "@/lib/utils";

/** A row of mutually exclusive options rendered as links (keeps every report view bookmarkable). */
export function SegmentLinks({
  label,
  options,
}: {
  label: string;
  options: { label: string; href: string; active: boolean }[];
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-[var(--radius-md)] border border-border bg-surface p-0.5">
      {options.map((o) => (
        <Link
          key={o.href}
          href={o.href}
          scroll={false}
          aria-current={o.active ? "true" : undefined}
          className={cn(
            "rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground",
            o.active && "bg-primary text-primary-foreground hover:text-primary-foreground"
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

export function SectionTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-sans text-lg font-bold text-foreground">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function DataTable({ head, children }: { head: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th key={i} className={cn("whitespace-nowrap p-3 font-medium", i > 0 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

/** Table cell; numbers right-align so columns of figures line up. */
export function Td({ children, num, className }: { children: React.ReactNode; num?: boolean; className?: string }) {
  return <td className={cn("p-3", num && "text-right tabular-nums", className)}>{children}</td>;
}
