import { auth } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { getHeroImages } from "@/lib/hero-images";
import { getOfficialPhotoUrl } from "@/lib/official-photos";
import { Hero } from "@/components/home/hero";
import { HeroImageCarousel } from "@/components/home/hero-image-carousel";
import { NoticeBanner } from "@/components/home/notice-banner";
import { SectionGrid } from "@/components/home/section-grid";
import { LiveCounters } from "@/components/home/live-counters";
import { FeaturedStory } from "@/components/home/featured-story";
import { LeaderboardPreview } from "@/components/home/leaderboard-preview";
import { MessageForStudents } from "@/components/home/message-for-students";
import { PersonalisedStrip } from "@/components/home/personalised-strip";
import { ToppersSection } from "@/components/home/toppers-section";
import {
  getHomeStats,
  getActiveAnnouncements,
  getFeaturedStory,
  getLeaderboardPreview,
  getNearestExamDeadline,
  getStudentPersonalisation,
} from "@/lib/queries/home";
import { getFeaturedToppers } from "@/lib/queries/toppers";

export default async function HomePage() {
  const session = await auth();
  const t = await getT();
  const heroImages = getHeroImages();
  const officialPhotos = {
    collector: getOfficialPhotoUrl("collector"),
    deo: getOfficialPhotoUrl("deo"),
  };

  const [stats, announcements, story, leaderboard, nearestExam, toppers] = await Promise.all([
    getHomeStats(),
    getActiveAnnouncements(),
    getFeaturedStory(),
    getLeaderboardPreview(),
    getNearestExamDeadline(),
    getFeaturedToppers(),
  ]);

  const personalisation =
    session?.user?.role === "STUDENT"
      ? await getStudentPersonalisation(session.user.id)
      : null;

  return (
    <div>
      {heroImages.length > 0 ? (
        <HeroImageCarousel images={heroImages} />
      ) : (
        <Hero session={session} />
      )}
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

        <MessageForStudents photos={officialPhotos} />

        <section>
          <h2 className="mb-4 font-sans text-xl font-bold text-foreground sm:text-2xl">
            {t("home.sectionsTitle")}
          </h2>
          <SectionGrid />
        </section>

        <LiveCounters stats={stats} />

        <div className="grid gap-8 lg:grid-cols-2">
          <FeaturedStory story={story} title={t("home.featuredStory")} />
          <LeaderboardPreview
            entries={leaderboard}
            title={t("home.topLeaderboard")}
            viewAllLabel={t("home.viewAll")}
          />
        </div>

        <ToppersSection toppers={toppers} />
      </div>
    </div>
  );
}
