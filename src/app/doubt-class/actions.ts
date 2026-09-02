"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { getOpenSlots } from "@/lib/doubt-slots";
import { sendEmail, renderNotification } from "@/lib/email";
import { buildICS } from "@/lib/ics";
import { BOOKING_MODE_LABEL } from "@/lib/weekday";
import { getT } from "@/lib/i18n/server";

const bookingSchema = z.object({
  teacherId: z.string().min(1),
  slotStartISO: z.string().min(1),
  topic: z.string().min(3).max(150),
  description: z.string().max(1000).optional(),
  attachmentUrl: z.string().optional(),
});

export type BookSlotState = { error?: string; success?: boolean };

export async function bookSlot(_prev: BookSlotState, formData: FormData): Promise<BookSlotState> {
  const t = await getT();
  const session = await requireUser();
  if (session.user.role !== "STUDENT") return { error: t("doubtClass.errors.studentOnly") };

  const parsed = bookingSchema.safeParse({
    teacherId: formData.get("teacherId"),
    slotStartISO: formData.get("slotStartISO"),
    topic: formData.get("topic"),
    description: formData.get("description") || undefined,
    attachmentUrl: formData.get("attachmentUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? t("doubtClass.errors.invalid") };
  const data = parsed.data;

  const slotStart = new Date(data.slotStartISO);
  if (Number.isNaN(slotStart.getTime())) return { error: t("doubtClass.errors.invalidTime") };

  // Re-derive the slot from the teacher's real availability server-side —
  // never trust the client for capacity/mode/meetingLink/duration.
  const openSlots = await getOpenSlots(data.teacherId);
  const slot = openSlots.find((s) => s.start.getTime() === slotStart.getTime());
  if (!slot) return { error: t("doubtClass.errors.slotUnavailable") };

  try {
    await prisma.$transaction(
      async (tx) => {
        const activeCount = await tx.doubtBooking.count({
          where: { teacherId: data.teacherId, slotStart, status: "BOOKED" },
        });
        if (activeCount >= slot.capacity) {
          throw new Error("SLOT_FULL");
        }
        await tx.doubtBooking.create({
          data: {
            studentId: session.user.id,
            teacherId: data.teacherId,
            slotStart,
            slotEnd: slot.end,
            topic: data.topic,
            description: data.description,
            attachmentUrl: data.attachmentUrl,
            mode: slot.mode,
            meetingLink: slot.meetingLink,
            status: "BOOKED",
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const isConflict =
      message === "SLOT_FULL" ||
      (e as { code?: string })?.code === "P2002" ||
      (e as { code?: string })?.code === "P2034";
    if (isConflict) return { error: t("doubtClass.errors.slotJustBooked") };
    throw e;
  }

  await notifyBooking(session.user.id, data.teacherId, slotStart, slot.end, data.topic, slot.meetingLink, slot.mode);

  revalidatePath("/doubt-class");
  return { success: true };
}

async function notifyBooking(
  studentId: string,
  teacherId: string,
  slotStart: Date,
  slotEnd: Date,
  topic: string,
  meetingLink: string | null,
  mode: string
) {
  const [student, teacher] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.user.findUnique({ where: { id: teacherId } }),
  ]);
  if (!student || !teacher) return;

  const when = new Intl.DateTimeFormat("hi-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(slotStart);

  const location = meetingLink || BOOKING_MODE_LABEL[mode];
  const ics = buildICS({
    uid: `doubtclass-${studentId}-${teacherId}-${slotStart.getTime()}@pariksha-saathi`,
    start: slotStart,
    end: slotEnd,
    summary: `शंका समाधान: ${topic}`,
    description: `विद्यार्थी: ${student.name}\nशिक्षक: ${teacher.name}\nविषय: ${topic}`,
    location,
    organizerEmail: teacher.email,
    organizerName: teacher.name,
    attendeeEmails: [student.email, teacher.email],
  });

  const commonDetails = `<p><strong>दिनांक/समय (IST):</strong> ${when}</p>
    <p><strong>विषय:</strong> ${topic}</p>
    <p><strong>माध्यम:</strong> ${location}</p>`;

  if (student.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${student.name},</p><p>आपकी शंका समाधान कक्षा ${teacher.name} के साथ निर्धारित हो गई है।</p>${commonDetails}`,
      `आपकी शंका समाधान कक्षा ${teacher.name} के साथ ${when} को निर्धारित है — ${topic}`
    );
    await sendEmail({
      to: student.email,
      subject: "परीक्षा साथी: शंका समाधान कक्षा बुक हुई",
      html,
      text,
      attachments: [{ filename: "doubt-class.ics", content: ics, contentType: "text/calendar" }],
    });
  }

  if (teacher.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${teacher.name},</p><p>${student.name} (कक्षा ${student.classLevel ?? "—"}, मो. ${student.mobile ?? "—"}) ने आपके साथ शंका समाधान कक्षा बुक की है।</p>${commonDetails}`,
      `${student.name} ने आपके साथ ${when} को शंका समाधान कक्षा बुक की — ${topic}`
    );
    await sendEmail({
      to: teacher.email,
      subject: "परीक्षा साथी: नई शंका समाधान बुकिंग",
      html,
      text,
      attachments: [{ filename: "doubt-class.ics", content: ics, contentType: "text/calendar" }],
    });
  }
}

const CANCEL_CUTOFF_HOURS = 2;

export async function cancelBooking(bookingId: string, reason: string) {
  const t = await getT();
  const session = await requireUser();
  const booking = await prisma.doubtBooking.findUnique({
    where: { id: bookingId },
    include: { student: true, teacher: true },
  });
  if (!booking) return;

  const isOwner = booking.studentId === session.user.id;
  const isTeacher = booking.teacherId === session.user.id;
  if (!isOwner && !isTeacher) return;

  const hoursUntil = (booking.slotStart.getTime() - Date.now()) / (1000 * 60 * 60);
  if (isOwner && hoursUntil < CANCEL_CUTOFF_HOURS) {
    throw new Error(t("doubtClass.errors.cancelCutoff", { hours: CANCEL_CUTOFF_HOURS }));
  }
  if (isTeacher && !reason.trim()) {
    throw new Error(t("doubtClass.errors.cancelReasonRequired"));
  }

  await prisma.doubtBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelReason: reason || null },
  });

  const when = new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(booking.slotStart);

  const recipient = isOwner ? booking.teacher : booking.student;
  if (recipient.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${recipient.name},</p>
       <p>${when} की शंका समाधान कक्षा (${booking.topic}) रद्द कर दी गई है।</p>
       ${reason ? `<p>कारण: ${reason}</p>` : ""}`,
      `${when} की शंका समाधान कक्षा रद्द कर दी गई है — ${booking.topic}`
    );
    await sendEmail({ to: recipient.email, subject: "परीक्षा साथी: शंका समाधान कक्षा रद्द", html, text });
  }

  revalidatePath("/doubt-class");
  revalidatePath("/admin/doubt-classes");
}

export async function markBookingOutcome(bookingId: string, status: "ATTENDED" | "NO_SHOW", notes: string) {
  const session = await requireUser();
  const booking = await prisma.doubtBooking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.teacherId !== session.user.id) return;

  await prisma.doubtBooking.update({
    where: { id: bookingId },
    data: { status, teacherNotes: notes || null },
  });
  revalidatePath("/admin/doubt-classes");
}

export async function rateBooking(bookingId: string, rating: number) {
  const session = await requireUser();
  const booking = await prisma.doubtBooking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.studentId !== session.user.id || booking.status !== "ATTENDED") return;

  await prisma.doubtBooking.update({ where: { id: bookingId }, data: { rating } });
  revalidatePath("/doubt-class");
}
