import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { getTeacherBookings } from "@/lib/queries/doubt-class";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TeacherBookingsList } from "@/components/doubt-class/teacher-bookings-list";
import { BOOKING_MODE_LABEL } from "@/lib/weekday";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from "@/lib/doubt-booking-status";

export default async function AdminDoubtClassesPage() {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);

  if (session.user.role === "TEACHER") {
    const [upcoming, past] = await Promise.all([
      getTeacherBookings(session.user.id, true),
      getTeacherBookings(session.user.id, false),
    ]);

    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-sans text-2xl font-bold text-foreground">शंका समाधान — मेरी कक्षाएँ</h1>
          <Link href="/admin/doubt-classes/availability">
            <Button size="sm">मेरी उपलब्धता प्रबंधित करें</Button>
          </Link>
        </div>
        {upcoming.length === 0 && past.length === 0 ? (
          <EmptyState icon={MessageCircleQuestion} title="अभी कोई बुकिंग नहीं है" description="पहले अपनी उपलब्धता सेट करें।" />
        ) : (
          <TeacherBookingsList upcoming={upcoming} past={past} />
        )}
      </div>
    );
  }

  const now = new Date();
  const bookings = await prisma.doubtBooking.findMany({
    where: { slotStart: { gte: now } },
    include: { teacher: { select: { name: true } }, student: { select: { name: true } } },
    orderBy: { slotStart: "asc" },
    take: 100,
  });

  const teacherCount = await prisma.user.count({ where: { role: "TEACHER", isActive: true, availability: { some: {} } } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">शंका समाधान — सभी बुकिंग</h1>
        <p className="text-sm text-muted-foreground">
          {teacherCount} सक्रिय शिक्षक · {bookings.length} आगामी बुकिंग
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState icon={MessageCircleQuestion} title="अभी कोई आगामी बुकिंग नहीं है" />
      ) : (
        <div className="space-y-2.5">
          {bookings.map((b) => (
            <Card key={b.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="text-sm">
                <p className="font-medium text-foreground">{b.topic}</p>
                <p className="text-xs text-muted-foreground">
                  {b.teacher.name} ← {b.student.name} ·{" "}
                  {new Intl.DateTimeFormat("hi-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  }).format(b.slotStart)}{" "}
                  · {BOOKING_MODE_LABEL[b.mode]}
                </p>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${BOOKING_STATUS_COLOR[b.status]}) 15%, transparent)`,
                  color: `var(${BOOKING_STATUS_COLOR[b.status]})`,
                }}
              >
                {BOOKING_STATUS_LABEL[b.status]}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
