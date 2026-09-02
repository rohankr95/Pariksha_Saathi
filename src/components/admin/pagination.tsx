import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminPagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-border hover:bg-surface-muted aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="text-muted-foreground">
        पृष्ठ {page} / {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-border hover:bg-surface-muted aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
