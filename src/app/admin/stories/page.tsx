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
import { getT } from "@/lib/i18n/server";

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminStories({ q: sp.q, page });
  const pendingCount = items.filter((s) => s.isSubmission && !s.isPublished).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("stories.admin.listTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("stories.admin.totalCount", { count: total })}
          {pendingCount > 0 && ` · ${t("stories.admin.pendingSubmissions", { count: pendingCount })}`}
        </p>
      </div>

      <AdminListToolbar
        searchPlaceholder={t("stories.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/stories/new"
        addLabel={t("stories.admin.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState icon={Trophy} title={t("stories.admin.emptyTitle")} description={t("stories.admin.emptyDesc")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("stories.admin.table.title")}</th>
                <th className="p-3">{t("stories.admin.table.person")}</th>
                <th className="p-3">{t("stories.admin.table.featured")}</th>
                <th className="p-3">{t("stories.admin.table.status")}</th>
                <th className="p-3 text-right">{t("stories.admin.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((story) => (
                <tr key={story.id} className={story.isSubmission && !story.isPublished ? "bg-accent/5" : ""}>
                  <td className="max-w-xs p-3 font-medium">
                    {story.title}
                    {story.isSubmission && (
                      <Badge variant="accent" className="ml-2 text-[10px]">
                        {t("stories.admin.studentSubmissionBadge")}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{story.personName}</td>
                  <td className="p-3">
                    <form action={toggleStoryFeatured.bind(null, story.id, !story.isFeatured)}>
                      <button
                        type="submit"
                        aria-label={story.isFeatured ? t("stories.admin.unmarkFeatured") : t("stories.admin.markFeatured")}
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
                        aria-label={t("stories.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteStory.bind(null, story.id)}>
                        <ConfirmSubmitButton confirmMessage={t("stories.admin.confirmDelete")} aria-label={t("stories.admin.delete")}>
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
