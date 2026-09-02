import { FileCheck2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getSubjects } from "@/lib/queries/curriculum";
import { getSubjectTeachers, getMyAnswerCopies, countRecentSubmissions } from "@/lib/queries/answer-copies";
import { ANSWER_COPY_WEEKLY_LIMIT } from "@/lib/answer-copy-status";
import { SubmitCopyForm } from "@/components/answer-copies/submit-copy-form";
import { MyCopiesList } from "@/components/answer-copies/my-copies-list";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "उत्तरपुस्तिका जाँच | परीक्षा साथी" };

export default async function AnswerCopiesPage() {
  const session = await auth();
  const isStudent = session?.user?.role === "STUDENT";

  const subjects = await getSubjects();
  const teacherLists = await Promise.all(subjects.map((s) => getSubjectTeachers(s.id)));
  const teachersBySubject = Object.fromEntries(subjects.map((s, i) => [s.id, teacherLists[i]]));

  const [copies, recentCount] = isStudent
    ? await Promise.all([getMyAnswerCopies(session!.user.id), countRecentSubmissions(session!.user.id)])
    : [[], 0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-answercopies)]/15 text-[var(--color-section-answercopies)]">
          <FileCheck2 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">उत्तरपुस्तिका जाँच</h1>
          <p className="text-sm text-muted-foreground">अपनी उत्तरपुस्तिका शिक्षक से जँचवाएँ</p>
        </div>
      </div>

      {!isStudent ? (
        <EmptyState icon={FileCheck2} title="उत्तरपुस्तिका जमा करने के लिए विद्यार्थी के रूप में लॉगिन करें" />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <SubmitCopyForm subjects={subjects} teachersBySubject={teachersBySubject} remaining={ANSWER_COPY_WEEKLY_LIMIT - recentCount} />
          <div>
            <h2 className="mb-3 font-sans text-lg font-semibold text-foreground">मेरी उत्तरपुस्तिकाएँ</h2>
            {copies.length === 0 ? (
              <p className="text-sm text-muted-foreground">अभी कोई उत्तरपुस्तिका जमा नहीं की गई है।</p>
            ) : (
              <MyCopiesList copies={copies} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
