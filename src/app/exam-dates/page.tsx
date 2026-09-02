import { CalendarClock, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getExams, getExamCategories, getUrgentDeadlines, getSubscribedExamIds } from "@/lib/queries/exams";
import { ExamCard } from "@/components/exams/exam-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { formatIST, daysUntil } from "@/lib/exam-status";
import type { ClassLevel } from "@prisma/client";

export const metadata = { title: "परीक्षा तिथि | परीक्षा साथी" };

export default async function ExamDatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const filters = {
    classLevel: sp.classLevel as ClassLevel | undefined,
    category: sp.category,
    page: sp.page ? Number(sp.page) : 1,
  };

  const [{ items, page, totalPages }, categories, urgent, subscribedIds] = await Promise.all([
    getExams(filters),
    getExamCategories(),
    getUrgentDeadlines(30),
    session?.user?.role === "STUDENT" ? getSubscribedExamIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-examdates)]/15 text-[var(--color-section-examdates)]">
          <CalendarClock className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">परीक्षा तिथि</h1>
          <p className="text-sm text-muted-foreground">बोर्ड व प्रवेश परीक्षाओं की महत्वपूर्ण तिथियाँ</p>
        </div>
      </div>

      {urgent.length > 0 && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-section-examdates)]/30 bg-[color-mix(in_srgb,var(--color-section-examdates)_8%,transparent)] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-section-examdates)]">
            <AlertTriangle className="h-4 w-4" /> निकट आवेदन अंतिम तिथियाँ (अगले 30 दिन)
          </p>
          <ul className="space-y-1 text-sm">
            {urgent.map((e) => {
              const remaining = daysUntil(e.applyEnd);
              return (
                <li key={e.id} className="flex items-center justify-between">
                  <span>{e.name}</span>
                  <span className="font-semibold text-[var(--color-section-examdates)]">
                    {remaining !== null && remaining >= 0 ? `${remaining} दिन शेष` : formatIST(e.applyEnd)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <form action="/exam-dates" className="mb-6 flex flex-wrap gap-2.5">
        <Select name="classLevel" defaultValue={filters.classLevel ?? ""} className="max-w-[180px]">
          <option value="">सभी कक्षाएँ</option>
          {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((c) => (
            <option key={c} value={c}>
              {CLASS_LEVEL_LABEL[c]}
            </option>
          ))}
        </Select>
        <Select name="category" defaultValue={filters.category ?? ""} className="max-w-[220px]">
          <option value="">सभी श्रेणियाँ</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          फ़िल्टर लागू करें
        </Button>
      </form>

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isStudent={session?.user?.role === "STUDENT"}
                subscribed={subscribedIds.has(exam.id)}
              />
            ))}
          </div>
          <AdminPagination page={page} totalPages={totalPages} basePath="/exam-dates" searchParams={sp} />
        </>
      ) : (
        <EmptyState icon={CalendarClock} title="कोई परीक्षा तिथि नहीं मिली" description="फ़िल्टर बदलकर पुनः प्रयास करें।" />
      )}
    </div>
  );
}
