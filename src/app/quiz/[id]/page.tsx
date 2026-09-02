import { notFound } from "next/navigation";
import Link from "next/link";
import { Lightbulb, Clock, ListChecks, AlertTriangle, RotateCcw } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMyAttemptsSummary } from "@/lib/queries/quizzes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startAttempt } from "../actions";

const DIFFICULTY_LABEL: Record<string, string> = { EASY: "आसान", MEDIUM: "मध्यम", HARD: "कठिन" };

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quiz, session] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id },
      include: { subject: true, chapter: true, _count: { select: { questions: true } } },
    }),
    auth(),
  ]);
  if (!quiz || !quiz.isPublished) notFound();

  const isStudent = session?.user?.role === "STUDENT";
  const summary = isStudent ? await getMyAttemptsSummary(id, session!.user.id) : null;

  const now = new Date();
  const notYetOpen = quiz.startAt && now < quiz.startAt;
  const closed = quiz.endAt && now > quiz.endAt;
  const attemptsLeft = summary ? quiz.maxAttempts - summary.completedCount : quiz.maxAttempts;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-quiz)]/15 text-[var(--color-section-quiz)]">
          <Lightbulb className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-xl font-bold text-foreground sm:text-2xl">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">
            {quiz.subject.nameHi}
            {quiz.chapter ? ` · ${quiz.chapter.nameHi}` : ""}
          </p>
        </div>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ListChecks className="h-4 w-4" /> {quiz._count.questions} प्रश्न
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" /> {quiz.timeLimitMin} मिनट
          </div>
          <Badge variant="outline" className="w-fit">{DIFFICULTY_LABEL[quiz.difficulty]}</Badge>
          <span className="text-muted-foreground">{quiz.marksPerQ} अंक/प्रश्न</span>
        </div>

        <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
          <li>• प्रति गलत उत्तर {quiz.negativeMarks} अंक की कटौती</li>
          <li>• अधिकतम {quiz.maxAttempts} प्रयास अनुमत ({attemptsLeft} शेष)</li>
          <li>• सबमिट करने के बाद उत्तर नहीं बदले जा सकते</li>
          <li>• प्रश्न व विकल्पों का क्रम प्रत्येक प्रयास में बदल सकता है</li>
        </ul>

        {!isStudent ? (
          <p className="mt-5 text-sm text-muted-foreground">प्रश्नोत्तरी में भाग लेने के लिए विद्यार्थी के रूप में लॉगिन करें।</p>
        ) : notYetOpen ? (
          <p className="mt-5 flex items-center gap-1.5 text-sm text-[var(--color-section-examdates)]">
            <AlertTriangle className="h-4 w-4" /> यह प्रश्नोत्तरी अभी उपलब्ध नहीं है।
          </p>
        ) : closed ? (
          <p className="mt-5 flex items-center gap-1.5 text-sm text-[var(--color-section-examdates)]">
            <AlertTriangle className="h-4 w-4" /> इस प्रश्नोत्तरी की समय सीमा समाप्त हो चुकी है।
          </p>
        ) : summary?.inProgress ? (
          <form action={startAttempt.bind(null, id)} className="mt-5">
            <Button type="submit" size="lg" variant="accent">
              <RotateCcw className="h-4 w-4" /> प्रयास जारी रखें
            </Button>
          </form>
        ) : attemptsLeft <= 0 ? (
          <div className="mt-5">
            <p className="text-sm text-muted-foreground">आपके सभी प्रयास पूर्ण हो चुके हैं।</p>
            {summary?.lastCompleted && (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={`/quiz/${id}/result/${summary.lastCompleted.id}`}>अंतिम परिणाम देखें</Link>
              </Button>
            )}
          </div>
        ) : (
          <form action={startAttempt.bind(null, id)} className="mt-5">
            <Button type="submit" size="lg" variant="accent">
              प्रश्नोत्तरी शुरू करें
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
