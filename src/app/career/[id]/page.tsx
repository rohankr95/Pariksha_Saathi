import { notFound } from "next/navigation";
import Link from "next/link";
import { Compass, IndianRupee, GraduationCap, MessageCircleQuestion } from "lucide-react";
import { getRoadmapById } from "@/lib/queries/roadmaps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Step = { step: string; detail: string };

function parseSteps(json: unknown): Step[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (s): s is Step => typeof s === "object" && s !== null && "step" in s && "detail" in s
  );
}

export default async function RoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roadmap = await getRoadmapById(id);
  if (!roadmap) notFound();

  const steps = parseSteps(roadmap.stepsJson);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-career)]/15 text-[var(--color-section-career)]">
          <Compass className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{roadmap.title}</h1>
          <Badge variant="outline">{roadmap.stream}</Badge>
        </div>
      </div>

      <p className="mt-4 text-base leading-relaxed text-foreground">{roadmap.overview}</p>

      {roadmap.eligibility && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" /> पात्रता: {roadmap.eligibility}
        </p>
      )}

      {roadmap.exams.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {roadmap.exams.map((e) => (
            <Badge key={e} variant="accent">
              {e}
            </Badge>
          ))}
        </div>
      )}

      {steps.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-sans text-lg font-bold text-foreground">चरण-दर-चरण मार्ग</h2>
          <ol className="relative ml-3 space-y-6 border-l-2 border-[var(--color-section-career)]/30 pl-6">
            {steps.map((s, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-section-career)] text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <p className="font-semibold text-foreground">{s.step}</p>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(roadmap.salaryRange || roadmap.scholarships) && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {roadmap.salaryRange && (
            <div className="rounded-[var(--radius-md)] border border-border p-3.5">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <IndianRupee className="h-4 w-4" /> औसत वेतन सीमा
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{roadmap.salaryRange}</p>
            </div>
          )}
          {roadmap.scholarships && (
            <div className="rounded-[var(--radius-md)] border border-border p-3.5">
              <p className="text-sm font-semibold text-foreground">छात्रवृत्ति विकल्प</p>
              <p className="mt-1 text-sm text-muted-foreground">{roadmap.scholarships}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-[var(--radius-lg)] bg-[var(--color-section-career)]/10 p-5 text-center">
        <p className="font-semibold text-foreground">इस करियर के बारे में और जानना चाहते हैं?</p>
        <Button asChild className="mt-3" variant="accent">
          <Link href="/class-request">
            <MessageCircleQuestion className="h-4 w-4" /> काउंसलर से बात करें
          </Link>
        </Button>
      </div>
    </div>
  );
}
