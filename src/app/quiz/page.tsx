import { Lightbulb } from "lucide-react";
import { getAvailableQuizzes } from "@/lib/queries/quizzes";
import { getSubjects } from "@/lib/queries/curriculum";
import { QuizCard } from "@/components/quiz/quiz-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import type { ClassLevel } from "@prisma/client";

export const metadata = { title: "प्रश्नोत्तरी | परीक्षा साथी" };

export default async function QuizListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    classLevel: sp.classLevel as ClassLevel | undefined,
    subjectId: sp.subjectId,
  };

  const [items, subjects] = await Promise.all([getAvailableQuizzes(filters), getSubjects(filters.classLevel)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-quiz)]/15 text-[var(--color-section-quiz)]">
          <Lightbulb className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">प्रश्नोत्तरी</h1>
          <p className="text-sm text-muted-foreground">अभ्यास करें और अपनी तैयारी जाँचें</p>
        </div>
      </div>

      <form action="/quiz" className="mb-6 flex flex-wrap gap-2.5">
        <Select name="classLevel" defaultValue={filters.classLevel ?? ""} className="max-w-[180px]">
          <option value="">सभी कक्षाएँ</option>
          {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((c) => (
            <option key={c} value={c}>
              {CLASS_LEVEL_LABEL[c]}
            </option>
          ))}
        </Select>
        <Select name="subjectId" defaultValue={filters.subjectId ?? ""} className="max-w-[220px]">
          <option value="">सभी विषय</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameHi}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          फ़िल्टर लागू करें
        </Button>
      </form>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Lightbulb} title="कोई प्रश्नोत्तरी उपलब्ध नहीं है" description="जल्द ही नई प्रश्नोत्तरी जोड़ी जाएगी।" />
      )}
    </div>
  );
}
