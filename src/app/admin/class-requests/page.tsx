import { HandHelping } from "lucide-react";
import { getAdminClassRequests } from "@/lib/queries/admin-class-requests";
import { AdminPagination } from "@/components/admin/pagination";
import { ClassRequestRow } from "@/components/admin/class-request-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CLASS_REQUEST_STATUS_LABEL } from "@/lib/class-request-status";
import type { ClassRequestStatus } from "@prisma/client";

export default async function AdminClassRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const status = sp.status as ClassRequestStatus | undefined;
  const { items, total, totalPages } = await getAdminClassRequests({ status, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">कक्षा अनुरोध</h1>
        <p className="text-sm text-muted-foreground">कुल {total} अनुरोध</p>
      </div>

      <form action="/admin/class-requests" className="mb-4 flex gap-2.5">
        <Select name="status" defaultValue={status ?? ""} className="max-w-[180px]">
          <option value="">सभी स्थितियाँ</option>
          {Object.entries(CLASS_REQUEST_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline">
          फ़िल्टर लागू करें
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon={HandHelping} title="कोई अनुरोध नहीं मिला" />
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
