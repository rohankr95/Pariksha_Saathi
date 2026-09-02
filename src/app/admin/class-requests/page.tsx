import { HandHelping } from "lucide-react";
import { getAdminClassRequests } from "@/lib/queries/admin-class-requests";
import { AdminPagination } from "@/components/admin/pagination";
import { ClassRequestRow } from "@/components/admin/class-request-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";
import type { ClassRequestStatus } from "@prisma/client";

export default async function AdminClassRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await getT();
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const status = sp.status as ClassRequestStatus | undefined;
  const { items, total, totalPages } = await getAdminClassRequests({ status, page });

  const statusValues: ClassRequestStatus[] = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "SCHEDULED", "COMPLETED", "DECLINED"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">{t("classRequest.admin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("classRequest.admin.totalRequests", { count: total })}</p>
      </div>

      <form action="/admin/class-requests" className="mb-4 flex gap-2.5">
        <Select name="status" defaultValue={status ?? ""} className="max-w-[180px]">
          <option value="">{t("classRequest.admin.allStatuses")}</option>
          {statusValues.map((value) => (
            <option key={value} value={value}>
              {t(`classRequest.status.${value}`)}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          {t("classRequest.admin.applyFilter")}
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon={HandHelping} title={t("classRequest.admin.empty")} />
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <ClassRequestRow key={r.id} request={r} />
          ))}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/class-requests" searchParams={sp} />
    </div>
  );
}
