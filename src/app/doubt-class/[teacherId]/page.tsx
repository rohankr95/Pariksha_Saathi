import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOpenSlots, groupSlotsByDay } from "@/lib/doubt-slots";
import { SlotBooking } from "@/components/doubt-class/slot-booking";
import { getT, getServerLocale } from "@/lib/i18n/server";

export default async function TeacherSlotsPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  const t = await getT();
  const locale = await getServerLocale();

  const teacher = await prisma.user.findUnique({
    where: { id: teacherId, role: "TEACHER", isActive: true },
    select: { id: true, name: true, subjects: { select: { nameHi: true } } },
  });
  if (!teacher) notFound();

  const slots = await getOpenSlots(teacherId);
  const grouped = groupSlotsByDay(slots);
  const days = Array.from(grouped.entries()).map(([date, daySlots]) => ({
    date,
    slots: daySlots.map((s) => ({
      startISO: s.start.toISOString(),
      label: s.start.toLocaleTimeString(locale === "hi" ? "hi-IN" : "en-IN", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }),
      capacity: s.capacity,
      bookedCount: s.bookedCount,
      mode: s.mode,
    })),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/doubt-class" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("doubtClass.teacherPage.backLink")}
      </Link>
      <h1 className="font-sans text-2xl font-bold text-foreground">{teacher.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {teacher.subjects.map((s) => s.nameHi).join(", ") || t("doubtClass.teacherPage.generalSubject")}
      </p>

      <SlotBooking teacherId={teacher.id} days={days} />
    </div>
  );
}
