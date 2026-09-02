import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";

export async function ComingSoon({
  icon,
  titleHi,
  titleEn,
  desc,
}: {
  icon: LucideIcon;
  titleHi: string;
  titleEn: string;
  desc: string;
}) {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium text-muted-foreground">{titleEn}</p>
      <h1 className="mt-1 font-sans text-2xl font-bold text-foreground sm:text-3xl">{titleHi}</h1>
      <div className="mt-6">
        <EmptyState icon={icon} title={t("common.comingSoonTitle")} description={desc} />
      </div>
    </div>
  );
}
