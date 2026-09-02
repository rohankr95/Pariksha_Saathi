import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Trash2, Flag, PlayCircle } from "lucide-react";
import { getAdminLectures, getUnresolvedBrokenLinkReports } from "@/lib/queries/admin-lectures";
import { LectureThumbnail } from "@/components/lectures/thumbnail";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { getT } from "@/lib/i18n/server";
import {
  toggleLecturePublish,
  deleteLecture,
  moveLectureOrder,
  resolveBrokenLinkReport,
} from "./actions";

export default async function AdminLecturesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const [{ items, total, totalPages }, reports] = await Promise.all([
    getAdminLectures({ q: sp.q, page }),
    getUnresolvedBrokenLinkReports(),
  ]);
  const t = await getT();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{t("lectures.admin.listTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("lectures.admin.totalCount", { count: total })}</p>
        </div>
      </div>

      {reports.length > 0 && (
        <Card className="mb-6 border-[var(--color-section-examdates)]/30 bg-[color-mix(in_srgb,var(--color-section-examdates)_8%,transparent)] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-section-examdates)]">
            <Flag className="h-4 w-4" /> {t("lectures.admin.brokenLinks.heading", { count: reports.length })}
          </p>
          <ul className="space-y-1.5 text-sm">
            {reports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  {r.lecture.title} {r.note && `— ${r.note}`}
                </span>
                <form action={resolveBrokenLinkReport.bind(null, r.id)}>
                  <button type="submit" className="shrink-0 text-xs font-medium text-primary hover:underline">
                    {t("lectures.admin.brokenLinks.markResolved")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <AdminListToolbar
        searchPlaceholder={t("lectures.admin.searchPlaceholder")}
        defaultSearch={sp.q}
        addHref="/admin/lectures/new"
        addLabel={t("lectures.admin.addLabel")}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={PlayCircle}
          title={t("lectures.admin.empty.title")}
          description={t("lectures.admin.empty.description")}
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("lectures.admin.table.title")}</th>
                <th className="p-3">{t("lectures.admin.table.subject")}</th>
                <th className="p-3">{t("lectures.admin.table.status")}</th>
                <th className="p-3">{t("lectures.admin.table.order")}</th>
                <th className="p-3 text-right">{t("lectures.admin.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((lecture) => (
                <tr key={lecture.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-surface-muted">
                        <LectureThumbnail src={lecture.thumbnailUrl} />
                      </div>
                      <span className="line-clamp-2 max-w-xs font-medium">{lecture.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {lecture.subject.nameHi}
                    {lecture.chapter && <><br /><span className="text-xs">{lecture.chapter.nameHi}</span></>}
                  </td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={lecture.isPublished}
                      action={toggleLecturePublish.bind(null, lecture.id, !lecture.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <form action={moveLectureOrder.bind(null, lecture.id, "up")}>
                        <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label={t("lectures.admin.moveUp")}>
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={moveLectureOrder.bind(null, lecture.id, "down")}>
                        <button type="submit" className="rounded p-1 hover:bg-surface-muted" aria-label={t("lectures.admin.moveDown")}>
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/lectures/${lecture.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label={t("lectures.admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteLecture.bind(null, lecture.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={t("lectures.admin.deleteConfirm")}
                          aria-label={t("lectures.admin.delete")}
                        >
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/lectures" searchParams={sp} />
    </div>
  );
}
