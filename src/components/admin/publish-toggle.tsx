import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublishToggle({
  isPublished,
  action,
}: {
  isPublished: boolean;
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        title={isPublished ? "अप्रकाशित करें" : "प्रकाशित करें"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          isPublished ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground"
        )}
      >
        {isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {isPublished ? "प्रकाशित" : "ड्राफ्ट"}
      </button>
    </form>
  );
}
