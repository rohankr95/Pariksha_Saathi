import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Clock, Eye, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { getLectureById, getRelatedLectures, getWatchedLectureIds } from "@/lib/queries/lectures";
import { youtubeNoCookieEmbedUrl, youtubeWatchUrl } from "@/lib/youtube";
import { Badge } from "@/components/ui/badge";
import { LectureCard } from "@/components/lectures/lecture-card";
import { WatchedToggle } from "@/components/lectures/watched-toggle";
import { ReportBrokenLinkButton } from "@/components/lectures/report-broken-link-button";
import { ViewTracker } from "@/components/lectures/view-tracker";
import { getT } from "@/lib/i18n/server";

export default async function LectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lecture, session] = await Promise.all([getLectureById(id), auth()]);
  if (!lecture) notFound();
  const t = await getT();

  const [related, watchedIds] = await Promise.all([
    getRelatedLectures(lecture.subjectId, lecture.id),
    session?.user ? getWatchedLectureIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  const embedUrl = youtubeNoCookieEmbedUrl(lecture.youtubeUrl);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ViewTracker lectureId={lecture.id} />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="aspect-video overflow-hidden rounded-[var(--radius-lg)] bg-black shadow-[var(--shadow-card)]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={lecture.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/70">
                {t("lectures.public.detail.videoUnavailable")}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={youtubeWatchUrl(lecture.youtubeUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" /> {t("lectures.public.detail.openOnYoutube")}
            </a>
            <span className="text-muted-foreground">·</span>
            <ReportBrokenLinkButton lectureId={lecture.id} />
          </div>

          <h1 className="mt-4 font-sans text-2xl font-bold text-foreground">{lecture.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {lecture.createdBy.name}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {t("lectures.public.detail.views", { count: lecture.views })}
            </span>
            {lecture.durationSec && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />{" "}
                {t("lectures.public.detail.durationMinutes", { count: Math.round(lecture.durationSec / 60) })}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge>{lecture.subject.nameHi}</Badge>
            {lecture.chapter && <Badge variant="outline">{lecture.chapter.nameHi}</Badge>}
            {lecture.tags.map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>
          {lecture.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {lecture.description}
            </p>
          )}

          {session?.user?.role === "STUDENT" && (
            <div className="mt-5">
              <WatchedToggle lectureId={lecture.id} initialWatched={watchedIds.has(lecture.id)} />
            </div>
          )}

          {lecture.playlist && lecture.playlist.lectures.length > 1 && (
            <div className="mt-8">
              <h2 className="mb-3 font-sans text-lg font-bold text-foreground">
                {t("lectures.public.detail.playlistLabel", { title: lecture.playlist.title })}
              </h2>
              <div className="space-y-2">
                {lecture.playlist.lectures.map((pl, i) => (
                  <Link
                    key={pl.id}
                    href={`/lectures/${pl.id}`}
                    className={
                      "flex items-center gap-3 rounded-[var(--radius-md)] border border-border p-2.5 text-sm hover:bg-surface-muted " +
                      (pl.id === lecture.id ? "border-primary bg-primary/5" : "")
                    }
                  >
                    <span className="w-5 shrink-0 text-center text-muted-foreground">{i + 1}</span>
                    <span className="line-clamp-1 flex-1">{pl.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside>
          <h2 className="mb-3 font-sans text-lg font-bold text-foreground">{t("lectures.public.detail.relatedTitle")}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {related.map((r) => (
              <LectureCard key={r.id} lecture={{ ...r, subject: lecture.subject, chapter: null }} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
