import { WifiOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "ऑफ़लाइन | परीक्षा साथी" };

export default async function OfflinePage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <EmptyState icon={WifiOff} title={t("pwa.offlineTitle")} description={t("pwa.offlineDesc")} />
    </div>
  );
}
