import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getT } from "@/lib/i18n/server";

type Story = {
  id: string;
  title: string;
  personName: string;
  designation: string | null;
  photoUrl: string | null;
  tags: string[];
};

export async function FeaturedStory({ story, title }: { story: Story | null; title: string }) {
  const t = await getT();
  return (
    <div>
      <h2 className="mb-4 font-sans text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      {story ? (
        <Link href={`/stories/${story.id}`}>
          <Card className="flex items-center gap-4 overflow-hidden p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] sm:p-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-section-stories)]/15 text-[var(--color-section-stories)]">
              <Trophy className="h-8 w-8" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-sans text-base font-semibold text-foreground">
                {story.title}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {story.personName}
                {story.designation ? ` · ${story.designation}` : ""}
              </p>
            </div>
          </Card>
        </Link>
      ) : (
        <EmptyState
          icon={Trophy}
          title={t("stories.featured.emptyTitle")}
          description={t("stories.featured.emptyDesc")}
        />
      )}
    </div>
  );
}
