import Link from "next/link";
import { Lightbulb, Clock, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DIFFICULTY_LABEL: Record<string, string> = { EASY: "आसान", MEDIUM: "मध्यम", HARD: "कठिन" };

type QuizCardData = {
  id: string;
  title: string;
  difficulty: string;
  timeLimitMin: number;
  marksPerQ: number;
  subject: { nameHi: string };
  chapter: { nameHi: string } | null;
  _count: { questions: number };
};

export function QuizCard({ quiz }: { quiz: QuizCardData }) {
  return (
    <Link href={`/quiz/${quiz.id}`}>
      <Card className="flex h-full flex-col gap-2 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-quiz)]/15 text-[var(--color-section-quiz)]">
          <Lightbulb className="h-5 w-5" />
        </span>
        <p className="font-sans text-base font-semibold text-foreground">{quiz.title}</p>
        <p className="text-xs text-muted-foreground">
          {quiz.subject.nameHi}
          {quiz.chapter ? ` · ${quiz.chapter.nameHi}` : ""}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">{DIFFICULTY_LABEL[quiz.difficulty]}</Badge>
          <span className="flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5" /> {quiz._count.questions} प्रश्न
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {quiz.timeLimitMin} मिनट
          </span>
        </div>
      </Card>
    </Link>
  );
}

export type { QuizCardData };
