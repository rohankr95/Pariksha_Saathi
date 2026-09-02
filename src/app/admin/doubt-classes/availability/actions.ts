"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

const availabilitySchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.coerce.number().int().min(10).max(180),
  capacity: z.coerce.number().int().min(1).max(50),
  mode: z.enum(["MEET", "PHONE", "IN_PERSON"]),
  meetingLink: z.string().max(300).optional(),
});

export async function createAvailability(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = availabilitySchema.parse({
    weekday: formData.get("weekday"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    slotMinutes: formData.get("slotMinutes"),
    capacity: formData.get("capacity"),
    mode: formData.get("mode"),
    meetingLink: formData.get("meetingLink") || undefined,
  });

  if (data.startTime >= data.endTime) {
    throw new Error("अंतिम समय प्रारंभ समय के बाद होना चाहिए");
  }

  await prisma.teacherAvailability.create({
    data: { ...data, teacherId: session.user.id },
  });

  revalidatePath("/admin/doubt-classes/availability");
}

export async function deleteAvailability(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.teacherAvailability.deleteMany({ where: { id, teacherId: session.user.id } });
  revalidatePath("/admin/doubt-classes/availability");
}

const exceptionSchema = z.object({
  date: z.string().min(1),
  reason: z.string().max(200).optional(),
});

export async function createBlackoutDate(formData: FormData) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  const data = exceptionSchema.parse({
    date: formData.get("date"),
    reason: formData.get("reason") || undefined,
  });

  await prisma.availabilityException.create({
    data: {
      teacherId: session.user.id,
      date: new Date(data.date),
      isBlocked: true,
      reason: data.reason,
    },
  });

  revalidatePath("/admin/doubt-classes/availability");
}

export async function deleteBlackoutDate(id: string) {
  const session = await requireRole(["TEACHER", "SUPER_ADMIN"]);
  await prisma.availabilityException.deleteMany({ where: { id, teacherId: session.user.id } });
  revalidatePath("/admin/doubt-classes/availability");
}
