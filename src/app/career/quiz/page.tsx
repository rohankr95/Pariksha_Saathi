import { InterestQuiz } from "@/components/career/interest-quiz";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "रुचि परीक्षण | परीक्षा साथी" };

export default async function CareerQuizPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-center font-sans text-2xl font-bold text-foreground">{t("career.quiz.title")}</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">{t("career.quiz.subtitle")}</p>
      <InterestQuiz />
    </div>
  );
}
