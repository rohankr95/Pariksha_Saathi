import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/require-role";
import { getMyBookings, getTeacherBookings } from "@/lib/queries/doubt-class";
import { EmptyState } from "@/components/ui/empty-state";
import { StudentBookingsList } from "@/components/doubt-class/student-bookings-list";
import { TeacherBookingsList } from "@/components/doubt-class/teacher-bookings-list";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "मेरी बुकिंग | परीक्षा साथी" };

export default async function MyBookingsPage() {
  const t = await getT();
  const session = await requireUser();
  const isTeacher = session.user.role === "TEACHER";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/doubt-class" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("doubtClass.teacherPage.backLink")}
      </Link>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">
        {isTeacher ? t("doubtClass.myBookings.titleTeacher") : t("doubtClass.myBookings.title")}
      </h1>

      {isTeacher ? <TeacherView teacherId={session.user.id} /> : <StudentView studentId={session.user.id} />}
    </div>
  );
}

async function StudentView({ studentId }: { studentId: string }) {
  const t = await getT();
  const bookings = await getMyBookings(studentId);
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title={t("doubtClass.myBookings.emptyTitle")}
        description={t("doubtClass.myBookings.emptyDescStudent")}
      />
    );
  }
  return <StudentBookingsList bookings={bookings} />;
}

async function TeacherView({ teacherId }: { teacherId: string }) {
  const t = await getT();
  const [upcoming, past] = await Promise.all([getTeacherBookings(teacherId, true), getTeacherBookings(teacherId, false)]);
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title={t("doubtClass.myBookings.emptyTitle")}
        description={t("doubtClass.myBookings.emptyDescTeacher")}
      />
    );
  }
  return <TeacherBookingsList upcoming={upcoming} past={past} />;
}
