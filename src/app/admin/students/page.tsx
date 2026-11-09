import { CheckCircle2, Search, Users, Wand2, School } from "lucide-react";
import type { ClassLevel } from "@prisma/client";
import { requireRole } from "@/lib/require-role";
import { getT, getServerLocale } from "@/lib/i18n/server";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { BLOCKS, blockLabel, isBlockValue } from "@/lib/blocks";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { EMPTY_BLOCK, getAdminStudents, getBlockCleanupSummary } from "@/lib/queries/admin-students";
import { applySuggestedBlocks, inferBlocksFromSchool, mapBlockValue } from "./actions";

const CLASS_LEVELS: ClassLevel[] = ["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"];

const textButton =
  "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-md)] px-3 text-sm font-medium text-foreground hover:text-foreground";

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole(["SUPER_ADMIN"]);
  const t = await getT();
  const locale = await getServerLocale();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const classLevel = CLASS_LEVELS.includes(sp.classLevel as ClassLevel) ? (sp.classLevel as ClassLevel) : undefined;

  const [summary, { items, total, totalPages }] = await Promise.all([
    getBlockCleanupSummary(),
    getAdminStudents({ q: sp.q, block: sp.block, classLevel, page }),
  ]);

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.students.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("admin.students.subtitle")}</p>

      {/* Block cleanup */}
      <Card className="mt-6 p-5">
        <h2 className="font-sans text-lg font-bold text-foreground">{t("admin.students.cleanup.title")}</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("admin.students.cleanup.intro")}</p>

        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-2xl font-bold text-success">{summary.standardCount}</p>
            <p className="text-xs text-muted-foreground">{t("admin.students.cleanup.standardCount")}</p>
          </div>
          <div>
            <p
              className="text-2xl font-bold"
              style={{ color: summary.needsFixCount > 0 ? "var(--color-section-examdates)" : undefined }}
            >
              {summary.needsFixCount}
            </p>
            <p className="text-xs text-muted-foreground">{t("admin.students.cleanup.needsFixCount")}</p>
          </div>
        </div>

        {summary.needsFix.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t("admin.students.cleanup.allGood")}
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {summary.suggestedCount > 0 && (
                <form action={applySuggestedBlocks}>
                  <ConfirmSubmitButton
                    confirmMessage={t("admin.students.cleanup.applySuggestedConfirm", { count: summary.suggestedCount })}
                    className={`${textButton} bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:brightness-110`}
                  >
                    <Wand2 className="h-4 w-4" aria-hidden="true" />
                    {t("admin.students.cleanup.applySuggested", { count: summary.suggestedCount })}
                  </ConfirmSubmitButton>
                </form>
              )}
              {summary.schoolInferable > 0 && (
                <form action={inferBlocksFromSchool}>
                  <ConfirmSubmitButton
                    confirmMessage={t("admin.students.cleanup.inferFromSchoolConfirm", { count: summary.schoolInferable })}
                    className={`${textButton} border border-border hover:bg-surface-muted`}
                  >
                    <School className="h-4 w-4" aria-hidden="true" />
                    {t("admin.students.cleanup.inferFromSchool", { count: summary.schoolInferable })}
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
            {summary.schoolInferable > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">{t("admin.students.cleanup.inferHint")}</p>
            )}

            <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3">{t("admin.students.cleanup.colSaved")}</th>
                    <th className="p-3">{t("admin.students.cleanup.colStudents")}</th>
                    <th className="p-3">{t("admin.students.cleanup.colSuggestion")}</th>
                    <th className="p-3">{t("admin.students.cleanup.colMapTo")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summary.needsFix.map((row) => (
                    <tr key={row.value}>
                      <td className="p-3 font-medium">
                        {row.value === EMPTY_BLOCK ? (
                          <span className="italic text-muted-foreground">{t("admin.students.cleanup.noBlock")}</span>
                        ) : (
                          // Quoted so stray spaces in the saved text are visible.
                          <span>&ldquo;{row.value}&rdquo;</span>
                        )}
                      </td>
                      <td className="p-3">{row.count}</td>
                      <td className="p-3">
                        {row.suggestion ? (
                          <span className="font-medium text-success">{blockLabel(row.suggestion, locale)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t("admin.students.cleanup.noSuggestion")}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <form action={mapBlockValue} className="flex items-center gap-2">
                          <input type="hidden" name="from" value={row.value} />
                          <Select name="to" defaultValue={row.suggestion ?? ""} required className="h-9 min-w-[140px] text-sm">
                            <option value="" disabled>
                              {t("auth.blockPlaceholder")}
                            </option>
                            {BLOCKS.map((b) => (
                              <option key={b.value} value={b.value}>
                                {locale === "en" ? b.en : b.value}
                              </option>
                            ))}
                          </Select>
                          <ConfirmSubmitButton
                            confirmMessage={t("admin.students.cleanup.applyConfirm", { count: row.count })}
                            className={`${textButton} border border-border hover:bg-surface-muted`}
                          >
                            {t("admin.students.cleanup.apply")}
                          </ConfirmSubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {summary.standard.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("admin.students.cleanup.distribution")}
            </p>
            <div className="flex flex-wrap gap-2">
              {BLOCKS.map((b) => {
                const count = summary.standard.find((r) => r.value === b.value)?.count ?? 0;
                return (
                  <span key={b.value} className="rounded-full border border-border px-3 py-1 text-xs">
                    {locale === "en" ? b.en : b.value} · <span className="font-semibold">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Student list */}
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-sans text-lg font-bold text-foreground">{t("admin.students.list.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.students.list.total", { count: total })}</p>
        </div>

        <form className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input type="search" name="q" defaultValue={sp.q} placeholder={t("admin.students.list.search")} className="pl-9" />
          </div>
          <Select name="block" defaultValue={sp.block ?? ""} className="w-auto min-w-[150px]">
            <option value="">{t("admin.students.list.allBlocks")}</option>
            {BLOCKS.map((b) => (
              <option key={b.value} value={b.value}>
                {locale === "en" ? b.en : b.value}
              </option>
            ))}
            <option value={EMPTY_BLOCK}>{t("admin.students.cleanup.noBlock")}</option>
          </Select>
          <Select name="classLevel" defaultValue={classLevel ?? ""} className="w-auto min-w-[130px]">
            <option value="">{t("admin.students.list.allClasses")}</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                {CLASS_LEVEL_LABEL[c]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline">
            {t("admin.students.list.filter")}
          </Button>
        </form>

        {items.length === 0 ? (
          <EmptyState icon={Users} title={t("admin.students.list.empty")} />
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3">{t("admin.students.list.colName")}</th>
                  <th className="p-3">{t("admin.students.list.colClass")}</th>
                  <th className="p-3">{t("admin.students.list.colBlock")}</th>
                  <th className="p-3">{t("admin.students.list.colSchool")}</th>
                  <th className="p-3">{t("admin.students.list.colContact")}</th>
                  <th className="p-3">{t("admin.students.list.colRegistered")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-medium">
                      {s.name}
                      {!s.isActive && (
                        <span className="ml-2 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {t("admin.students.list.inactive")}
                        </span>
                      )}
                    </td>
                    <td className="p-3">{s.classLevel ? CLASS_LEVEL_LABEL[s.classLevel] : "—"}</td>
                    <td className="p-3">
                      {isBlockValue(s.block) ? (
                        blockLabel(s.block, locale)
                      ) : (
                        <span className="text-[var(--color-section-examdates)]">{s.block || "—"}</span>
                      )}
                    </td>
                    <td className="max-w-[220px] truncate p-3 text-muted-foreground" title={s.school ?? undefined}>
                      {s.school ?? "—"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      <div>{s.mobile ?? "—"}</div>
                      <div className="max-w-[200px] truncate">{s.email}</div>
                    </td>
                    <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} totalPages={totalPages} basePath="/admin/students" searchParams={sp} />
      </section>
    </div>
  );
}
