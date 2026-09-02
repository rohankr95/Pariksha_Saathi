import { prisma } from "@/lib/prisma";

export async function getDoubtClassTeachers(subjectId?: string) {
  return prisma.user.findMany({
    where: {
      role: "TEACHER",
      isActive: true,
      availability: { some: {} },
      ...(subjectId ? { subjects: { some: { id: subjectId } } } : {}),
    },
    select: { id: true, name: true, subjects: { select: { nameHi: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getMyBookings(studentId: string) {
  return prisma.doubtBooking.findMany({
    where: { studentId },
    include: { teacher: { select: { name: true } } },
    orderBy: { slotStart: "desc" },
  });
}

export async function getTeacherBookings(teacherId: string, upcoming: boolean) {
  const now = new Date();
  return prisma.doubtBooking.findMany({
    where: {
      teacherId,
      ...(upcoming ? { slotStart: { gte: now }, status: "BOOKED" } : { slotStart: { lt: now } }),
    },
    include: { student: { select: { name: true, classLevel: true, mobile: true } } },
    orderBy: { slotStart: upcoming ? "asc" : "desc" },
  });
}
