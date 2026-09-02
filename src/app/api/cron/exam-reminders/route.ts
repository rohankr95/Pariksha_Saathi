import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, renderNotification } from "@/lib/email";
import { formatIST, daysUntil } from "@/lib/exam-status";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — open (local/dev only)
  const header = req.headers.get("authorization");
  const query = req.nextUrl.searchParams.get("secret");
  return header === `Bearer ${secret}` || query === secret;
}

/**
 * Sends exam-deadline reminder emails 7 days and 1 day before `applyEnd`.
 * Wire this up to a real scheduler (Linux cron via curl, GitHub Actions,
 * Vercel Cron, etc.) hitting this route once a day. See README §Deployment.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.examSubscription.findMany({
    where: {
      OR: [{ reminderSent7d: false }, { reminderSent1d: false }],
    },
    include: { user: true, exam: true },
  });

  let sent7d = 0;
  let sent1d = 0;

  for (const sub of subscriptions) {
    if (!sub.exam.applyEnd || !sub.user.email) continue;
    const remaining = daysUntil(sub.exam.applyEnd);
    if (remaining === null || remaining < 0) continue;

    if (!sub.reminderSent7d && remaining <= 7) {
      const { html, text } = renderNotification(
        `<p>नमस्ते ${sub.user.name},</p>
         <p><strong>${sub.exam.name}</strong> के लिए आवेदन की अंतिम तिथि निकट है —
         <strong>${formatIST(sub.exam.applyEnd)}</strong> (लगभग ${remaining} दिन शेष)।</p>
         ${sub.exam.officialUrl ? `<p><a href="${sub.exam.officialUrl}">आधिकारिक वेबसाइट पर जाएँ</a></p>` : ""}`,
        `${sub.exam.name} के लिए आवेदन की अंतिम तिथि ${formatIST(sub.exam.applyEnd)} है (${remaining} दिन शेष)।`
      );
      await sendEmail({ to: sub.user.email, subject: `परीक्षा साथी: ${sub.exam.name} — आवेदन तिथि निकट`, html, text });
      await prisma.examSubscription.update({ where: { id: sub.id }, data: { reminderSent7d: true } });
      sent7d++;
    }

    if (!sub.reminderSent1d && remaining <= 1) {
      const { html, text } = renderNotification(
        `<p>नमस्ते ${sub.user.name},</p>
         <p><strong>${sub.exam.name}</strong> के लिए आवेदन की अंतिम तिथि <strong>कल है</strong> —
         ${formatIST(sub.exam.applyEnd)}। अभी आवेदन करें।</p>
         ${sub.exam.officialUrl ? `<p><a href="${sub.exam.officialUrl}">आधिकारिक वेबसाइट पर जाएँ</a></p>` : ""}`,
        `${sub.exam.name} के लिए आवेदन की अंतिम तिथि कल है — ${formatIST(sub.exam.applyEnd)}।`
      );
      await sendEmail({ to: sub.user.email, subject: `परीक्षा साथी: ${sub.exam.name} — अंतिम तिथि कल!`, html, text });
      await prisma.examSubscription.update({ where: { id: sub.id }, data: { reminderSent1d: true } });
      sent1d++;
    }
  }

  return NextResponse.json({ checked: subscriptions.length, sent7d, sent1d });
}
