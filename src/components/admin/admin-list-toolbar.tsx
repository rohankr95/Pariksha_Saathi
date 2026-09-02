import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminListToolbar({
  searchPlaceholder,
  defaultSearch,
  addHref,
  addLabel,
}: {
  searchPlaceholder: string;
  defaultSearch?: string;
  addHref: string;
  addLabel: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form className="relative max-w-sm flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          name="q"
          defaultValue={defaultSearch}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </form>
      <Button asChild size="sm">
        <Link href={addHref}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </Link>
      </Button>
    </div>
  );
}
