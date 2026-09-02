import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";

type RoadmapCardData = { id: string; title: string; stream: string; overview: string };

export async function RoadmapCard({ roadmap }: { roadmap: RoadmapCardData }) {
  const t = await getT();
  return (
    <Link href={`/career/${roadmap.id}`}>
      <Card className="flex h-full flex-col gap-2 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-career)]/15 text-[var(--color-section-career)]">
          <Compass className="h-5 w-5" />
        </span>
        <p className="font-sans text-base font-semibold text-foreground">{roadmap.title}</p>
        <Badge variant="outline" className="w-fit text-[10px]">
          {roadmap.stream}
        </Badge>
        <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">{roadmap.overview}</p>
        <span className="flex items-center gap-1 text-xs font-medium text-primary">
          {t("career.card.viewFull")} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Card>
    </Link>
  );
}

export type { RoadmapCardData };
