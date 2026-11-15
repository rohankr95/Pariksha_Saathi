import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** India-day key ("YYYY-MM-DD") for the current moment. */
function istDay(): string {
  const ist = new Date(Date.now() + 330 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

// Records one "site open" for today. Called once per browser session by the
// traffic beacon. A logged-in visitor is keyed by user id (so their role is
// trusted from the session); an anonymous one sends a random, non-identifying
// browser id and is recorded as GUEST.
export async function POST(req: NextRequest) {
  const session = await auth();

  let visitorKey: string;
  let role: string;
  if (session?.user) {
    visitorKey = `u:${session.user.id}`;
    role = session.user.role;
  } else {
    let vid = "";
    try {
      const body = await req.json();
      vid = typeof body?.vid === "string" ? body.vid : "";
    } catch {
      /* no body */
    }
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(vid)) return NextResponse.json({ ok: true });
    visitorKey = `g:${vid}`;
    role = "GUEST";
  }

  const day = istDay();
  try {
    await prisma.siteVisit.upsert({
      where: { day_visitorKey: { day, visitorKey } },
      update: { visits: { increment: 1 }, role },
      create: { day, visitorKey, role },
    });
  } catch {
    // Traffic logging must never break a page load.
  }
  return NextResponse.json({ ok: true });
}
