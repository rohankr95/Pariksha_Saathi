import Link from "next/link";
import { Pencil, Trash2, Medal, Users } from "lucide-react";
import { getAdminOlympiads } from "@/lib/queries/admin-olympiads";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { toggleOlympiadPublish, deleteOlympiad } from "./actions";

export default async function AdminOlympiadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminOlympiads({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">ओलंपियाड</h1>
        <p className="text-sm text-muted-foreground">कुल {total} ओलंपियाड</p>
      </div>

      <AdminListToolbar
        searchPlaceholder="ओलंपियाड खोजें..."
        defaultSearch={sp.q}
        addHref="/admin/olympiads/new"
        addLabel="नया ओलंपियाड"
      />

      {items.length === 0 ? (
        <EmptyState icon={Medal} title="कोई ओलंपियाड नहीं मिला" description="नया ओलंपियाड जोड़ें।" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">नाम</th>
                <th className="p-3">रुचि पंजीकरण</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((olympiad) => (
                <tr key={olympiad.id}>
                  <td className="max-w-xs p-3 font-medium">
                    {olympiad.name}
                    <br />
                    <span className="text-xs text-muted-foreground">{olympiad.body}</span>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/olympiads/${olympiad.id}/interested`}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Users className="h-3.5 w-3.5" /> {olympiad._count.interests} विद्यार्थी
                    </Link>
                  </td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={olympiad.isPublished}
                      action={toggleOlympiadPublish.bind(null, olympiad.id, !olympiad.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/olympiads/${olympiad.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteOlympiad.bind(null, olympiad.id)}>
                        <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस ओलंपियाड को हटाना चाहते हैं?" aria-label="हटाएँ">
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/olympiads" searchParams={sp} />
    </div>
  );
}
