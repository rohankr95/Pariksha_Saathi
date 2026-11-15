import Link from "next/link";
import { MessageSquare, Mail, Trash2, Check, CheckCheck, RotateCcw } from "lucide-react";
import type { FeedbackStatus } from "@prisma/client";
import { requireRole } from "@/lib/require-role";
import { getAdminFeedback } from "@/lib/queries/admin-feedback";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { getT, getServerLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { setFeedbackStatus, deleteFeedback } from "./actions";

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  NEW: "bg-[color-mix(in_srgb,var(--color-section-answercopies)_15%,transparent)] text-[var(--color-section-answercopies)]",
  READ: "bg-surface-muted text-muted-foreground",
  RESOLVED: "bg-success/15 text-success",
};

const FILTERS: { key: string; status?: FeedbackStatus; label: string }[] = [
  { key: "all", label: "filterAll" },
  { key: "NEW", status: "NEW", label: "filterNew" },
  { key: "READ", status: "READ", label: "filterRead" },
  { key: "RESOLVED", status: "RESOLVED", label: "filterResolved" },
];

function formatWhen(d: Date, locale: "hi" | "en") {
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole(["SUPER_ADMIN"]);
  const t = await getT();
  const locale = await getServerLocale();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const status = (["NEW", "READ", "RESOLVED"] as const).includes(sp.status as FeedbackStatus)
    ? (sp.status as FeedbackStatus)
    : undefined;

  const { items, totalPages, counts } = await getAdminFeedback({ status, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.feedback.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.feedback.subtitle")}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (f.status ?? undefined) === status;
          const count = f.status ? counts[f.status] : counts.all;
          return (
            <Link
              key={f.key}
              href={f.status ? `/admin/feedback?status=${f.status}` : "/admin/feedback"}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {t(`admin.feedback.${f.label}`)} ({count})
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={MessageSquare} title={t("admin.feedback.empty")} />
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <Card key={f.id} className={cn("p-4", f.status === "NEW" && "border-l-4 border-l-[var(--color-section-answercopies)]")}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLE[f.status])}>
                      {t(`admin.feedback.status.${f.status}`)}
                    </span>
                    {f.category && (
                      <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        {t(`admin.feedback.categories.${f.category}`)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{formatWhen(f.createdAt, locale)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">{f.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("admin.feedback.from")}: {f.name || (f.userId ? "" : t("admin.feedback.anonymous"))}
                    {f.userRole ? ` · ${f.userRole}` : f.userId ? "" : ` · ${t("admin.feedback.guest")}`}
                    {" · "}
                    {f.email ? (
                      <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Mail className="h-3 w-3" aria-hidden="true" /> {f.email}
                      </a>
                    ) : (
                      t("admin.feedback.noEmail")
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {f.status !== "READ" && (
                  <form action={setFeedbackStatus.bind(null, f.id, "READ")}>
                    <Button type="submit" variant="outline" size="sm">
                      <Check className="h-4 w-4" aria-hidden="true" /> {t("admin.feedback.markRead")}
                    </Button>
                  </form>
                )}
                {f.status !== "RESOLVED" ? (
                  <form action={setFeedbackStatus.bind(null, f.id, "RESOLVED")}>
                    <Button type="submit" variant="outline" size="sm">
                      <CheckCheck className="h-4 w-4" aria-hidden="true" /> {t("admin.feedback.markResolved")}
                    </Button>
                  </form>
                ) : (
                  <form action={setFeedbackStatus.bind(null, f.id, "NEW")}>
                    <Button type="submit" variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t("admin.feedback.reopen")}
                    </Button>
                  </form>
                )}
                <form action={deleteFeedback.bind(null, f.id)} className="ml-auto">
                  <ConfirmSubmitButton confirmMessage={t("admin.feedback.deleteConfirm")} aria-label={t("admin.feedback.delete")}>
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/feedback" searchParams={sp} />
    </div>
  );
}
