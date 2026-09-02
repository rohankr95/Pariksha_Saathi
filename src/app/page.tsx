import { auth } from "@/lib/auth";
import { Hero } from "@/components/home/hero";
import { NoticeBanner } from "@/components/home/notice-banner";
import { SectionGrid } from "@/components/home/section-grid";
import { LiveCounters } from "@/components/home/live-counters";
import { FeaturedStory } from "@/components/home/featured-story";
import { LeaderboardPreview } from "@/components/home/leaderboard-preview";
import { PersonalisedStrip } from "@/components/home/personalised-strip";
import {
  getHomeStats,
  getActiveAnnouncements,
  getFeaturedStory,
  getLeaderboardPreview,
  getNearestExamDeadline,
  getStudentPersonalisation,
} from "@/lib/queries/home";

export default async function HomePage() {
  const session = await auth();

  const [stats, announcements, story, leaderboard, nearestExam] = await Promise.all([
    getHomeStats(),
    getActiveAnnouncements(),
    getFeaturedStory(),
    getLeaderboardPreview(),
    getNearestExamDeadline(),
  ]);

  const personalisation =
    session?.user?.role === "STUDENT"
      ? await getStudentPersonalisation(session.user.id)
      : null;

  return (
    <div>
      <Hero session={session} />
      <NoticeBanner announcements={announcements} />

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:py-10">
        {personalisation && (
          <PersonalisedStrip
            continueLecture={personalisation.continueLecture}
            nextBooking={personalisation.nextBooking}
            nearestExam={nearestExam}
            pendingAnswerCopy={personalisation.pendingAnswerCopy}
          />
        )}

        <section>
          <h2 className="mb-4 font-sans text-xl font-bold text-foreground sm:text-2xl">
            सभी सुविधाएँ
          </h2>
          <SectionGrid />
        </section>

        <LiveCounters stats={stats} />

        <div className="grid gap-8 lg:grid-cols-2">
          <FeaturedStory story={story} title="प्रेरणादायक कहानी" />
          <LeaderboardPreview entries={leaderboard} title="शीर्ष प्रदर्शनकर्ता" viewAllLabel="सभी देखें" />
        </div>
      </div>
    </div>
  );
}
