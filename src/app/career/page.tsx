import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { getRoadmaps, getRoadmapStreams, getSuggestedRoadmaps } from "@/lib/queries/roadmaps";
import { RoadmapCard } from "@/components/career/roadmap-card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "करियर रोडमैप | परीक्षा साथी" };

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const suggested = sp.suggested ? sp.suggested.split(",").filter(Boolean) : [];

  const [items, streams, suggestedRoadmaps] = await Promise.all([
    getRoadmaps(sp.stream),
    getRoadmapStreams(),
    getSuggestedRoadmaps(suggested),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-career)]/15 text-[var(--color-section-career)]">
            <Compass className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">करियर रोडमैप</h1>
            <p className="text-sm text-muted-foreground">अपने करियर का रास्ता चुनें</p>
          </div>
        </div>
        <Button asChild variant="accent" size="sm">
          <Link href="/career/quiz">
            <Sparkles className="h-4 w-4" /> रुचि परीक्षण लें
          </Link>
        </Button>
      </div>

      {suggestedRoadmaps.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-foreground">आपके लिए सुझाए गए</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {suggestedRoadmaps.map((r) => (
              <RoadmapCard key={r.id} roadmap={r} />
            ))}
          </div>
        </div>
      )}

      <form action="/career" className="mb-6 flex gap-2.5">
        <Select name="stream" defaultValue={sp.stream ?? ""} className="max-w-[220px]">
          <option value="">सभी स्ट्रीम</option>
          {streams.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          फ़िल्टर लागू करें
        </Button>
      </form>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Compass} title="कोई रोडमैप नहीं मिला" description="जल्द ही और रोडमैप जोड़े जाएँगे।" />
      )}
    </div>
  );
}
