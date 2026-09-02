import { Flame, Star, PlayCircle, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await requireUser();

  const [streak, lecturesWatched, quizAttempts] = await Promise.all([
    prisma.studentStreak.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    }),
    prisma.lectureWatchProgress.count({ where: { userId: session.user.id, watched: true } }),
    prisma.quizAttempt.count({ where: { studentId: session.user.id, submittedAt: { not: null } } }),
  ]);

  const cards = [
    { label: "स्ट्रीक", value: `${streak.currentStreak} दिन`, icon: Flame, color: "--color-section-stories" },
    { label: "XP अंक", value: streak.xp, icon: Star, color: "--color-section-quiz" },
    { label: "देखे गए व्याख्यान", value: lecturesWatched, icon: PlayCircle, color: "--color-section-lectures" },
    { label: "प्रश्नोत्तरी प्रयास", value: quizAttempts, icon: Lightbulb, color: "--color-section-leaderboard" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-sans text-2xl font-bold text-foreground">
        नमस्ते {session.user.displayName || session.user.name?.split(" ")[0]}! 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">आपकी तैयारी का सारांश</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4 text-center">
              <span
                className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${card.color}) 15%, transparent)`,
                  color: `var(${card.color})`,
                }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-2 text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        प्रगति चार्ट, बैज और कमजोर अध्याय सारांश Phase 6 में जोड़े जाएँगे।
      </p>
    </div>
  );
}
