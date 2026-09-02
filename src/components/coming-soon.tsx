import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function ComingSoon({
  icon,
  titleHi,
  titleEn,
  descHi,
}: {
  icon: LucideIcon;
  titleHi: string;
  titleEn: string;
  descHi: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium text-muted-foreground">{titleEn}</p>
      <h1 className="mt-1 font-sans text-2xl font-bold text-foreground sm:text-3xl">{titleHi}</h1>
      <div className="mt-6">
        <EmptyState icon={icon} title="यह सुविधा जल्द जुड़ रही है" description={descHi} />
      </div>
    </div>
  );
}
