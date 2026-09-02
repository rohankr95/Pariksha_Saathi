import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeaderboard } from "@/lib/queries/leaderboard";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import type { ClassLevel, LeaderboardPeriod } from "@prisma/client";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const entries = await getLeaderboard({
    period: (sp.get("period") as LeaderboardPeriod) || "ALL_TIME",
    subjectId: sp.get("subjectId") || undefined,
    classLevel: (sp.get("classLevel") as ClassLevel) || undefined,
    school: sp.get("school") || undefined,
    block: sp.get("block") || undefined,
  });

  const header = ["रैंक", "नाम", "विद्यालय", "कक्षा", "अंक", "सटीकता %", "प्रयास"];
  const rows = entries.map((e) => [
    String(e.rank),
    e.displayName,
    e.school,
    e.classLevel ? CLASS_LEVEL_LABEL[e.classLevel] : "",
    String(e.points),
    String(e.accuracy),
    String(e.quizzesAttempted),
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leaderboard-${Date.now()}.csv"`,
    },
  });
}
