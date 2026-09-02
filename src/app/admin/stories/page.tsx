import Link from "next/link";
import { Pencil, Trash2, Trophy, Star } from "lucide-react";
import { getAdminStories } from "@/lib/queries/admin-stories";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { toggleStoryPublish, toggleStoryFeatured, deleteStory } from "./actions";

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminStories({ q: sp.q, page });
  const pendingCount = items.filter((s) => s.isSubmission && !s.isPublished).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">प्रेरक कहानियाँ</h1>
        <p className="text-sm text-muted-foreground">
          कुल {total} कहानियाँ
          {pendingCount > 0 && ` · ${pendingCount} छात्र सबमिशन समीक्षा हेतु लंबित`}
        </p>
      </div>

      <AdminListToolbar
        searchPlaceholder="कहानियाँ खोजें..."
        defaultSearch={sp.q}
        addHref="/admin/stories/new"
        addLabel="नई कहानी"
      />

      {items.length === 0 ? (
        <EmptyState icon={Trophy} title="कोई कहानी नहीं मिली" description="नई कहानी जोड़ें।" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">शीर्षक</th>
                <th className="p-3">व्यक्ति</th>
                <th className="p-3">विशेष</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((story) => (
                <tr key={story.id} className={story.isSubmission && !story.isPublished ? "bg-accent/5" : ""}>
                  <td className="max-w-xs p-3 font-medium">
                    {story.title}
                    {story.isSubmission && (
                      <Badge variant="accent" className="ml-2 text-[10px]">
                        छात्र सबमिशन
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{story.personName}</td>
                  <td className="p-3">
                    <form action={toggleStoryFeatured.bind(null, story.id, !story.isFeatured)}>
                      <button
                        type="submit"
                        aria-label={story.isFeatured ? "विशेष हटाएँ" : "विशेष बनाएँ"}
                        className="rounded p-1 hover:bg-surface-muted"
                      >
                        <Star
                          className={`h-4 w-4 ${story.isFeatured ? "fill-accent text-accent" : "text-muted-foreground"}`}
                        />
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={story.isPublished}
                      action={toggleStoryPublish.bind(null, story.id, !story.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/stories/${story.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteStory.bind(null, story.id)}>
                        <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस कहानी को हटाना चाहते हैं?" aria-label="हटाएँ">
                          <Trash2 className="h-4 w-4" />
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/stories" searchParams={sp} />
    </div>
  );
}
