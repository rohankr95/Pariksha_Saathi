import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";

export async function AdminComingSoon({
  icon,
  titleHi,
  titleEn,
  phase,
}: {
  icon: LucideIcon;
  titleHi: string;
  titleEn: string;
  phase: string;
}) {
  const t = await getT();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{titleHi}</h1>
          <p className="text-sm text-muted-foreground">{titleEn}</p>
        </div>
        <Badge variant="accent">{phase}</Badge>
      </div>
      <EmptyState icon={icon} title={t("admin.comingSoon.title")} description={t("admin.comingSoon.desc")} />
    </div>
  );
}
