"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { logAudit } from "@/lib/audit";
import { sendEmail, renderNotification } from "@/lib/email";
import { BLOCK_VALUES, isBlockValue, normalizeBlock } from "@/lib/blocks";
import { EMPTY_BLOCK, getSchoolInferenceCandidates } from "@/lib/queries/admin-students";

function done() {
  revalidatePath("/admin/students");
  revalidatePath("/admin/analytics");
  revalidatePath("/leaderboard");
}

// A short, readable temp password: lowercase letters + digits, with ambiguous
// characters (0/o, 1/l/i) left out so it's easy to read aloud and type on a
// phone. 8 chars comfortably clears the 6-char minimum.
function generateReadablePassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export type ResetPasswordResult = { password?: string; emailed?: boolean; error?: boolean };

/**
 * Super Admin resets a student's password. Returns the new temporary password
 * so staff can read it out to a mobile-only student (who has no email to send
 * it to); it is also emailed when the student does have an email.
 */
export async function resetStudentPassword(studentId: string): Promise<ResetPasswordResult> {
  const session = await requireRole(["SUPER_ADMIN"]);
  const student = await prisma.user.findFirst({ where: { id: studentId, role: "STUDENT" } });
  if (!student) return { error: true };

  const password = generateReadablePassword();
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: studentId }, data: { passwordHash } });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "StudentAccount",
    entityId: studentId,
    meta: { action: "password_reset" },
  });

  let emailed = false;
  if (student.email) {
    const loginId = student.mobile || student.email;
    const { html, text } = renderNotification(
      `<p>नमस्ते ${student.name},</p>
       <p>आपका परीक्षा साथी पासवर्ड रीसेट कर दिया गया है।</p>
       <p><strong>लॉगिन:</strong> ${loginId}<br/><strong>नया अस्थायी पासवर्ड:</strong> ${password}</p>
       <p>कृपया लॉगिन कर इसे तुरंत बदल लें (मेरी प्रोफ़ाइल → पासवर्ड बदलें)।</p>`,
      `आपका नया अस्थायी पासवर्ड: ${password} (लॉगिन: ${loginId})`
    );
    await sendEmail({ to: student.email, subject: "परीक्षा साथी: पासवर्ड रीसेट", html, text });
    emailed = true;
  }

  revalidatePath("/admin/students");
  return { password, emailed };
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
