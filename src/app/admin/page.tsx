import {
  HandHelping,
  MessageCircleQuestion,
  FileCheck2,
  UserPlus,
  AlertTriangle,
  Users,
  GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAdminDashboardCounts } from "@/lib/queries/admin-dashboard";
import { getT } from "@/lib/i18n/server";

export default async function AdminDashboardPage() {
  const t = await getT();
  const counts = await getAdminDashboardCounts();

  const cards = [
    { label: t("admin.dashboard.pendingClassRequests"), value: counts.pendingClassRequests, icon: HandHelping, color: "--color-section-classrequest" },
    { label: t("admin.dashboard.doubtClassesToday"), value: counts.doubtClassesToday, icon: MessageCircleQuestion, color: "--color-section-doubtclass" },
    { label: t("admin.dashboard.answerCopiesPending"), value: counts.answerCopiesPending, icon: FileCheck2, color: "--color-section-answercopies" },
    { label: t("admin.dashboard.newRegistrations"), value: counts.newRegistrations, icon: UserPlus, color: "--color-section-lectures" },
    { label: t("admin.dashboard.brokenLinkReports"), value: counts.brokenLinkReports, icon: AlertTriangle, color: "--color-section-examdates" },
    { label: t("admin.dashboard.totalTeachers"), value: counts.totalTeachers, icon: Users, color: "--color-section-career" },
    { label: t("admin.dashboard.totalStudents"), value: counts.totalStudents, icon: GraduationCap, color: "--color-section-quiz" },
  ];

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("admin.dashboard.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("admin.dashboard.subtitle")}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${card.color}) 15%, transparent)`,
                  color: `var(${card.color})`,
                }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
