import { prisma } from "@/lib/prisma";

export async function getAdminDashboardCounts() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    pendingClassRequests,
    doubtClassesToday,
    answerCopiesPending,
    newRegistrations,
    brokenLinkReports,
    totalTeachers,
    totalStudents,
  ] = await Promise.all([
    prisma.classRequest.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.doubtBooking.count({
      where: { status: "BOOKED", slotStart: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.answerCopy.count({ where: { status: { in: ["SUBMITTED", "ASSIGNED", "UNDER_EVALUATION"] } } }),
    prisma.user.count({ where: { role: "STUDENT", createdAt: { gte: sevenDaysAgo } } }),
    prisma.brokenLinkReport.count({ where: { resolved: false } }),
    prisma.user.count({ where: { role: "TEACHER", isActive: true } }),
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
  ]);

  return {
    pendingClassRequests,
    doubtClassesToday,
    answerCopiesPending,
    newRegistrations,
    brokenLinkReports,
    totalTeachers,
    totalStudents,
  };
}
