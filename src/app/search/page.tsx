import { Search } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { getT } from "@/lib/i18n/server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getT();
  return (
    <ComingSoon
      icon={Search}
      titleHi={q ? `खोज परिणाम: "${q}"` : "खोजें"}
      titleEn="Search"
      desc={t("search.comingSoonDesc")}
    />
  );
}
