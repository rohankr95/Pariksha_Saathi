import { ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CLASS_REQUEST_STATUS_COLOR } from "@/lib/class-request-status";
import { getT } from "@/lib/i18n/server";
import type { ClassRequestStatus } from "@prisma/client";

type RequestData = {
  id: string;
  chapter: string | null;
  status: ClassRequestStatus;
  upvotes: number;
  adminRemark: string | null;
  subject: { nameHi: string };
  preferredTeacher: { name: string } | null;
};

export async function MyRequestsList({ requests }: { requests: RequestData[] }) {
  const t = await getT();

  return (
    <div>
      <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">{t("classRequest.myRequests.heading")}</h2>
      {requests.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={t("classRequest.myRequests.emptyTitle")}
          description={t("classRequest.myRequests.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {r.subject.nameHi}
                    {r.chapter ? ` · ${r.chapter}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.preferredTeacher ? r.preferredTeacher.name : t("classRequest.anyTeacherLabel")} ·{" "}
                    {t("classRequest.myRequests.supportCount", { count: r.upvotes })}
                  </p>
                  {r.adminRemark && (
                    <p className="mt-1 rounded-[var(--radius-sm)] bg-surface-muted p-1.5 text-xs text-muted-foreground">
                      {r.adminRemark}
                    </p>
                  )}
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(${CLASS_REQUEST_STATUS_COLOR[r.status]}) 15%, transparent)`,
                    color: `var(${CLASS_REQUEST_STATUS_COLOR[r.status]})`,
                  }}
                >
                  {t(`classRequest.status.${r.status}`)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
