import { PlayCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getLectures } from "@/lib/queries/lectures";
import { getSubjects, getChapters } from "@/lib/queries/curriculum";
import { getWatchedLectureIds } from "@/lib/queries/lectures";
import { ContentFilterBar } from "@/components/shared/content-filter-bar";
import { LectureCard } from "@/components/lectures/lecture-card";
import { LECTURE_SPECIAL_TAGS } from "@/lib/lecture-tags";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import type { ClassLevel, Language } from "@prisma/client";

export const metadata = { title: "व्याख्यान | परीक्षा साथी" };

export default async function LecturesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();

  const filters = {
    classLevel: sp.classLevel as ClassLevel | undefined,
    subjectId: sp.subjectId,
    chapterId: sp.chapterId,
    language: sp.language as Language | undefined,
    tag: sp.tag,
    q: sp.q,
    page: sp.page ? Number(sp.page) : 1,
  };

  const [{ items, page, totalPages }, subjects, chapters, watchedIds] = await Promise.all([
    getLectures(filters),
    getSubjects(filters.classLevel),
    getChapters(filters.subjectId),
    session?.user ? getWatchedLectureIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-lectures)]/15 text-[var(--color-section-lectures)]">
          <PlayCircle className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">व्याख्यान</h1>
          <p className="text-sm text-muted-foreground">विषयवार वीडियो पाठ, कक्षा 10 और 12 के लिए</p>
        </div>
      </div>

      <ContentFilterBar
        action="/lectures"
        subjects={subjects}
        chapters={chapters}
        tags={LECTURE_SPECIAL_TAGS}
        searchPlaceholder="व्याख्यान खोजें..."
        current={filters}
      />

      {items.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} watched={watchedIds.has(lecture.id)} />
            ))}
          </div>
          <AdminPagination page={page} totalPages={totalPages} basePath="/lectures" searchParams={sp} />
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={PlayCircle}
            title="कोई व्याख्यान नहीं मिला"
            description="फ़िल्टर बदलकर पुनः प्रयास करें, या जल्द ही नए व्याख्यान जोड़े जाएँगे।"
          />
        </div>
      )}
    </div>
  );
}
