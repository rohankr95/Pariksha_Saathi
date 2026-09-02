import Link from "next/link";
import { Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/server";

type StoryCardData = {
  id: string;
  title: string;
  personName: string;
  designation: string | null;
  photoUrl: string | null;
  tags: string[];
  isFeatured: boolean;
};

export async function StoryCard({ story }: { story: StoryCardData }) {
  const t = await getT();
  return (
    <Link href={`/stories/${story.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <div className="relative flex aspect-[4/3] items-center justify-center bg-[var(--color-section-stories)]/10">
          {story.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={story.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Trophy className="h-10 w-10 text-[var(--color-section-stories)]" aria-hidden="true" />
          )}
          {story.isFeatured && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              <Star className="h-3 w-3" /> {t("stories.card.featuredBadge")}
            </span>
          )}
        </div>
        <div className="p-3.5">
          <p className="line-clamp-2 text-sm font-semibold text-foreground">{story.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {story.personName}
            {story.designation ? ` · ${story.designation}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {story.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="accent" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export type { StoryCardData };
