import { notFound } from "next/navigation";
import { Trophy, MapPin } from "lucide-react";
import { getStoryById } from "@/lib/queries/stories";
import { youtubeNoCookieEmbedUrl } from "@/lib/youtube";
import { Badge } from "@/components/ui/badge";

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStoryById(id);
  if (!story) notFound();

  const embedUrl = story.videoUrl ? youtubeNoCookieEmbedUrl(story.videoUrl) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-section-stories)]/15">
          {story.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={story.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Trophy className="h-9 w-9 text-[var(--color-section-stories)]" />
          )}
        </div>
        <div>
          <h1 className="font-sans text-xl font-bold text-foreground sm:text-2xl">{story.title}</h1>
          <p className="text-sm text-muted-foreground">
            {story.personName}
            {story.designation ? ` · ${story.designation}` : ""}
          </p>
          {(story.district || story.block) && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {[story.block, story.district].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {story.tags.map((tag) => (
          <Badge key={tag} variant="accent">
            {tag}
          </Badge>
        ))}
      </div>

      {embedUrl && (
        <div className="mt-6 aspect-video overflow-hidden rounded-[var(--radius-lg)] bg-black shadow-[var(--shadow-card)]">
          <iframe
            src={embedUrl}
            title={story.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {story.body && (
        <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground">{story.body}</p>
      )}
    </div>
  );
}
