import { Search } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <ComingSoon
      icon={Search}
      titleHi={q ? `खोज परिणाम: "${q}"` : "खोजें"}
      titleEn="Search"
      descHi="व्याख्यान, नोट्स और पुस्तकों में खोज आगामी चरण में जोड़ी जाएगी।"
    />
  );
}
