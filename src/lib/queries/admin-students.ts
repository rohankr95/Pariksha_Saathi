import type { ClassLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BLOCK_VALUES, inferBlockFromText, isBlockValue, normalizeBlock, type BlockValue } from "@/lib/blocks";

/** Sentinel for "no block saved" (NULL or blank) in forms and URLs. */
export const EMPTY_BLOCK = "__EMPTY__";

export type BlockValueRow = {
  value: string;
  count: number;
  status: "standard" | "suggested" | "unmatched" | "missing";
  suggestion: BlockValue | null;
};

export async function getBlockCleanupSummary() {
  const groups = await prisma.user.groupBy({
    by: ["block"],
    where: { role: "STUDENT" },
    _count: { _all: true },
  });

  const missingCount = groups
    .filter((g) => !g.block || g.block.trim() === "")
    .reduce((sum, g) => sum + g._count._all, 0);

  const rows: BlockValueRow[] = groups
    .filter((g) => g.block && g.block.trim() !== "")
    .map((g) => {
      const value = g.block as string;
      if (isBlockValue(value)) return { value, count: g._count._all, status: "standard" as const, suggestion: value };
      const suggestion = normalizeBlock(value);
      return { value, count: g._count._all, status: suggestion ? ("suggested" as const) : ("unmatched" as const), suggestion };
    })
    .sort((a, b) => b.count - a.count);

  if (missingCount > 0) rows.push({ value: EMPTY_BLOCK, count: missingCount, status: "missing", suggestion: null });

  const standard = rows.filter((r) => r.status === "standard");
  const needsFix = rows.filter((r) => r.status !== "standard");
  const schoolInferable = (await getSchoolInferenceCandidates()).length;

  return {
    standard,
    needsFix,
    standardCount: standard.reduce((s, r) => s + r.count, 0),
    needsFixCount: needsFix.reduce((s, r) => s + r.count, 0),
    suggestedCount: needsFix.filter((r) => r.status === "suggested").reduce((s, r) => s + r.count, 0),
    schoolInferable,
  };
}

/**
 * Students whose block can't be resolved from the block text itself (blank or
 * unrecognised) but whose school name names exactly one block.
 */
export async function getSchoolInferenceCandidates(): Promise<{ id: string; block: BlockValue }[]> {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT", OR: [{ block: null }, { block: { notIn: BLOCK_VALUES } }] },
    select: { id: true, block: true, school: true },
  });
  return students.flatMap((s) => {
    if (normalizeBlock(s.block)) return [];
    const inferred = inferBlockFromText(s.school);
    return inferred ? [{ id: s.id, block: inferred }] : [];
  });
}

export async function getAdminStudents(params: {
  q?: string;
  block?: string;
  classLevel?: ClassLevel;
  page: number;
  pageSize?: number;
}) {
  const pageSize = params.pageSize ?? 25;
  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    ...(params.classLevel && { classLevel: params.classLevel }),
    ...(params.block === EMPTY_BLOCK
      ? { OR: [{ block: null }, { block: "" }] }
      : params.block
        ? { block: params.block }
        : {}),
    ...(params.q && {
      AND: [
        {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { email: { contains: params.q, mode: "insensitive" } },
            { mobile: { contains: params.q } },
            { school: { contains: params.q, mode: "insensitive" } },
          ],
        },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        classLevel: true,
        school: true,
        block: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
