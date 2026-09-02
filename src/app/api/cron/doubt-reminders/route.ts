import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, renderNotification } from "@/lib/email";
import { BOOKING_MODE_LABEL } from "@/lib/weekday";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — open (local/dev only)
  const header = req.headers.get("authorization");
  const query = req.nextUrl.searchParams.get("secret");
  return header === `Bearer ${secret}` || query === secret;
}

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat("hi-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

/**
 * Sends doubt-class reminder emails 24h and 1h before the booked slot, to
 * both the student and the teacher. Wire this up to a real scheduler
 * (Linux cron via curl, GitHub Actions, Vercel Cron, etc.) hitting this
 * route every ~15 minutes. See README §Deployment.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const bookings = await prisma.doubtBooking.findMany({
    where: {
      status: "BOOKED",
      slotStart: { gte: now, lte: in25h },
      OR: [{ reminderSent24h: false }, { reminderSent1h: false }],
    },
    include: { student: true, teacher: true },
  });

  let sent24h = 0;
  let sent1h = 0;

  for (const b of bookings) {
    const hoursUntil = (b.slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    const when = formatWhen(b.slotStart);
    const location = b.meetingLink || BOOKING_MODE_LABEL[b.mode];

    if (!b.reminderSent24h && hoursUntil <= 24) {
      await notifyBoth(b, when, location, "24 घंटे");
      await prisma.doubtBooking.update({ where: { id: b.id }, data: { reminderSent24h: true } });
      sent24h++;
    }

    if (!b.reminderSent1h && hoursUntil <= 1) {
      await notifyBoth(b, when, location, "1 घंटा");
      await prisma.doubtBooking.update({ where: { id: b.id }, data: { reminderSent1h: true } });
      sent1h++;
    }
  }

  return NextResponse.json({ checked: bookings.length, sent24h, sent1h });
}

async function notifyBoth(
  b: { topic: string; student: { name: string; email: string }; teacher: { name: string; email: string } },
  when: string,
  location: string,
  label: string
) {
  if (b.student.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${b.student.name},</p>
       <p>आपकी शंका समाधान कक्षा (${b.topic}) ${when} को है — लगभग ${label} शेष।</p>
       <p><strong>माध्यम:</strong> ${location}</p>`,
      `आपकी शंका समाधान कक्षा ${when} को है (लगभग ${label} शेष) — ${b.topic}`
    );
    await sendEmail({ to: b.student.email, subject: `परीक्षा साथी: शंका समाधान कक्षा याद दिलाना (${label})`, html, text });
  }
  if (b.teacher.email) {
    const { html, text } = renderNotification(
      `<p>नमस्ते ${b.teacher.name},</p>
       <p>${b.student.name} के साथ आपकी शंका समाधान कक्षा (${b.topic}) ${when} को है — लगभग ${label} शेष।</p>
       <p><strong>माध्यम:</strong> ${location}</p>`,
      `${b.student.name} के साथ आपकी शंका समाधान कक्षा ${when} को है (लगभग ${label} शेष) — ${b.topic}`
    );
    await sendEmail({ to: b.teacher.email, subject: `परीक्षा साथी: शंका समाधान कक्षा याद दिलाना (${label})`, html, text });
  }
}
