"use client";

import { useTransition } from "react";
import { UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActiveToggle({
  isActive,
  activeLabel,
  inactiveLabel,
  action,
}: {
  isActive: boolean;
  activeLabel: string;
  inactiveLabel: string;
  action: (next: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => action(!isActive))}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isActive ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground"
      )}
    >
      {isActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
      {isActive ? activeLabel : inactiveLabel}
    </button>
  );
}
