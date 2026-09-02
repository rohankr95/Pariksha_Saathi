import Link from "next/link";
import { MessageCircleQuestion, CalendarClock, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDoubtClassTeachers } from "@/lib/queries/doubt-class";
import { getSubjects } from "@/lib/queries/curriculum";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "शंका समाधान | परीक्षा साथी" };

export default async function DoubtClassPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const t = await getT();
  const session = await auth();
  const { subjectId } = await searchParams;

  const [teachers, subjects] = await Promise.all([getDoubtClassTeachers(subjectId), getSubjects()]);

  const isStudent = session?.user?.role === "STUDENT";
  const isTeacher = session?.user?.role === "TEACHER";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-doubtclass)]/15 text-[var(--color-section-doubtclass)]">
            <MessageCircleQuestion className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">{t("doubtClass.browse.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("doubtClass.browse.subtitle")}</p>
          </div>
        </div>
        {isStudent && (
          <Link href="/doubt-class/my-bookings">
            <Button variant="outline" size="sm">
              <CalendarClock className="h-4 w-4" /> {t("doubtClass.browse.myBookings")}
            </Button>
          </Link>
        )}
        {isTeacher && (
          <div className="flex gap-2">
            <Link href="/doubt-class/my-bookings">
              <Button variant="outline" size="sm">
                <CalendarClock className="h-4 w-4" /> {t("doubtClass.browse.myClasses")}
              </Button>
            </Link>
            <Link href="/admin/doubt-classes/availability">
              <Button size="sm">{t("doubtClass.browse.manageAvailability")}</Button>
            </Link>
          </div>
        )}
      </div>

      <form className="mb-6">
        <Select name="subjectId" defaultValue={subjectId ?? ""} className="max-w-xs">
          <option value="">{t("doubtClass.browse.allSubjects")}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameHi}
            </option>
          ))}
        </Select>
      </form>

      {teachers.length === 0 ? (
        <EmptyState
          icon={MessageCircleQuestion}
          title={t("doubtClass.browse.emptyTitle")}
          description={t("doubtClass.browse.emptyDesc")}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {teachers.map((teacher) => (
            <Link key={teacher.id} href={`/doubt-class/${teacher.id}`}>
              <Card className="flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                <div>
                  <p className="font-semibold text-foreground">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {teacher.subjects.map((s) => s.nameHi).join(", ") || t("doubtClass.browse.generalSubject")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
