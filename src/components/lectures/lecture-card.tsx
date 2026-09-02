import Link from "next/link";
import { PlayCircle, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LectureThumbnail } from "@/components/lectures/thumbnail";
import { getT } from "@/lib/i18n/server";

type LectureCardData = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  views: number;
  tags: string[];
  subject: { nameHi: string };
  chapter: { nameHi: string } | null;
};

function formatDuration(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function LectureCard({ lecture, watched }: { lecture: LectureCardData; watched?: boolean }) {
  const t = await getT();
  return (
    <Link href={`/lectures/${lecture.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <div className="relative aspect-video bg-surface-muted">
          <LectureThumbnail src={lecture.thumbnailUrl} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <PlayCircle className="h-10 w-10 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
          </div>
          {lecture.durationSec && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {formatDuration(lecture.durationSec)}
            </span>
          )}
          {watched && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-white">
              {t("lectures.public.card.watchedBadge")}
            </span>
          )}
        </div>
        <div className="p-3.5">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {lecture.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {lecture.subject.nameHi}
            {lecture.chapter ? ` · ${lecture.chapter.nameHi}` : ""}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {lecture.tags.slice(0, 1).map((tag) => (
                <Badge key={tag} variant="default" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Eye className="h-3 w-3" /> {lecture.views}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { formatDuration };
export type { LectureCardData };
