import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Highest delta we trust from a single ping. The client pings roughly every
// 20s while the video is playing (plus one flush on tab-hide/close), so
// anything above this is either a stalled tab that caught up in one burst or
// a spoofed request — cap it rather than let it inflate watch-hours.
const MAX_DELTA_SECONDS = 30;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lectureId } = await params;
  const body = await req.json().catch(() => null);
  const deltaSeconds = Math.floor(Number(body?.deltaSeconds));
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
    return NextResponse.json({ error: "Invalid deltaSeconds" }, { status: 400 });
  }
  const clampedDelta = Math.min(deltaSeconds, MAX_DELTA_SECONDS);

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: { durationSec: true },
  });
  if (!lecture) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  const progress = await prisma.lectureWatchProgress.upsert({
    where: { lectureId_userId: { lectureId, userId: session.user.id } },
    create: { lectureId, userId: session.user.id, watchedSeconds: clampedDelta },
    update: { watchedSeconds: { increment: clampedDelta } },
  });

  // Auto-complete once 90% of the runtime is watched — never auto-unset an
  // existing true, and never overwrite it back to false.
  if (!progress.watched && lecture.durationSec && progress.watchedSeconds >= lecture.durationSec * 0.9) {
    await prisma.lectureWatchProgress.update({
      where: { lectureId_userId: { lectureId, userId: session.user.id } },
      data: { watched: true },
    });
  }

  return NextResponse.json({ ok: true, watchedSeconds: progress.watchedSeconds });
}
