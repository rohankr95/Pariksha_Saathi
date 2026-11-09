"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { BLOCK_VALUES, isBlockValue, normalizeBlock } from "@/lib/blocks";
import { EMPTY_BLOCK, getSchoolInferenceCandidates } from "@/lib/queries/admin-students";

function done() {
  revalidatePath("/admin/students");
  revalidatePath("/admin/analytics");
  revalidatePath("/leaderboard");
}

/** Re-points every student whose block is exactly `from` to the chosen standard block. */
export async function mapBlockValue(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN"]);
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  if (!from || !isBlockValue(to)) return;

  const where =
    from === EMPTY_BLOCK
      ? { role: "STUDENT" as const, OR: [{ block: null }, { block: "" }] }
      : { role: "STUDENT" as const, block: from };
  const result = await prisma.user.updateMany({ where, data: { block: to } });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "StudentBlock",
    entityId: "bulk",
    meta: { from: from === EMPTY_BLOCK ? null : from, to, students: result.count },
  });
  done();
}

/** Applies every confident match (spelling/case/language variants of the six blocks) in one go. */
export async function applySuggestedBlocks() {
  const session = await requireRole(["SUPER_ADMIN"]);
  const groups = await prisma.user.groupBy({
    by: ["block"],
    where: { role: "STUDENT", block: { notIn: BLOCK_VALUES } },
  });
  const mappings = groups.flatMap((g) => {
    const to = normalizeBlock(g.block);
    return g.block && to ? [{ from: g.block, to }] : [];
  });
  if (mappings.length === 0) return;

  const results = await prisma.$transaction(
    mappings.map((m) => prisma.user.updateMany({ where: { role: "STUDENT", block: m.from }, data: { block: m.to } }))
  );

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "StudentBlock",
    entityId: "bulk",
    meta: {
      mode: "suggested",
      mappings: mappings.map((m, i) => ({ ...m, students: results[i].count })),
    },
  });
  done();
}

/** For students whose block text is blank/unrecognised, uses the block named in their school's name. */
export async function inferBlocksFromSchool() {
  const session = await requireRole(["SUPER_ADMIN"]);
  const candidates = await getSchoolInferenceCandidates();
  if (candidates.length === 0) return;

  await prisma.$transaction(
    candidates.map((c) => prisma.user.update({ where: { id: c.id }, data: { block: c.block } }))
  );

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "StudentBlock",
    entityId: "bulk",
    meta: { mode: "from-school", students: candidates.length },
  });
  done();
}
