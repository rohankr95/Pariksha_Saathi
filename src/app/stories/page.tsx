import Link from "next/link";
import { Trophy, PenLine } from "lucide-react";
import { getStories } from "@/lib/queries/stories";
import { StoryCard } from "@/components/stories/story-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { STORY_TAGS } from "@/lib/story-tags";

export const metadata = { title: "प्रेरक कहानियाँ | परीक्षा साथी" };

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, page: currentPage, totalPages } = await getStories({ tag: sp.tag, page });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-stories)]/15 text-[var(--color-section-stories)]">
            <Trophy className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">प्रेरक कहानियाँ</h1>
            <p className="text-sm text-muted-foreground">IAS, टॉपर्स और स्थानीय उपलब्धियों की कहानियाँ</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/stories/submit">
            <PenLine className="h-4 w-4" /> अपनी कहानी भेजें
          </Link>
        </Button>
      </div>

      <form action="/stories" className="mb-6 flex flex-wrap items-center gap-1.5">
        <label className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary">
          <input type="radio" name="tag" value="" defaultChecked={!sp.tag} className="sr-only" />
          सभी
        </label>
        {STORY_TAGS.map((tag) => (
          <label
            key={tag}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
          >
            <input type="radio" name="tag" value={tag} defaultChecked={sp.tag === tag} className="sr-only" />
            {tag}
          </label>
        ))}
        <Button type="submit" size="sm" variant="outline">
          फ़िल्टर लागू करें
        </Button>
      </form>

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
          <AdminPagination page={currentPage} totalPages={totalPages} basePath="/stories" searchParams={sp} />
        </>
      ) : (
        <EmptyState icon={Trophy} title="कोई कहानी नहीं मिली" description="जल्द ही नई कहानियाँ जोड़ी जाएँगी।" />
      )}
    </div>
  );
}
