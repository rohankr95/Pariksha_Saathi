import type { FeedbackStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminFeedback({ status, page = 1 }: { status?: FeedbackStatus; page?: number }) {
  const where: Prisma.FeedbackWhereInput = status ? { status } : {};
  const [items, total, counts] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.feedback.count({ where }),
    prisma.feedback.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const byStatus = new Map(counts.map((c) => [c.status, c._count._all]));
  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    counts: {
      all: counts.reduce((s, c) => s + c._count._all, 0),
      NEW: byStatus.get("NEW") ?? 0,
      READ: byStatus.get("READ") ?? 0,
      RESOLVED: byStatus.get("RESOLVED") ?? 0,
    },
  };
}

export async function getNewFeedbackCount() {
  return prisma.feedback.count({ where: { status: "NEW" } });
}
