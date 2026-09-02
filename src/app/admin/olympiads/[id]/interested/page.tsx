import { notFound } from "next/navigation";
import { getOlympiadInterestList } from "@/lib/queries/admin-olympiads";
import { EmptyState } from "@/components/ui/empty-state";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { getT } from "@/lib/i18n/server";
import { Users } from "lucide-react";

export default async function OlympiadInterestedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const { olympiad, interests } = await getOlympiadInterestList(id);
  if (!olympiad) notFound();

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-foreground">{olympiad.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("olympiad.admin.interestedSubtitle", { count: interests.length })}
      </p>

      {interests.length === 0 ? (
        <EmptyState icon={Users} title={t("olympiad.admin.noInterest")} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">{t("olympiad.admin.colStudentName")}</th>
                <th className="p-3">{t("olympiad.admin.colClass")}</th>
                <th className="p-3">{t("olympiad.admin.colSchool")}</th>
                <th className="p-3">{t("olympiad.admin.colBlock")}</th>
                <th className="p-3">{t("olympiad.admin.colMobile")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {interests.map((i) => (
                <tr key={i.id}>
                  <td className="p-3 font-medium">{i.student.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {i.student.classLevel ? CLASS_LEVEL_LABEL[i.student.classLevel] : "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">{i.student.school}</td>
                  <td className="p-3 text-muted-foreground">{i.student.block}</td>
                  <td className="p-3 text-muted-foreground">{i.student.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
