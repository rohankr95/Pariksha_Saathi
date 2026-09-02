import Link from "next/link";
import { Pencil, Trash2, Compass } from "lucide-react";
import { getAdminRoadmaps } from "@/lib/queries/admin-roadmaps";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { toggleRoadmapPublish, deleteRoadmap } from "./actions";

export default async function AdminRoadmapsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminRoadmaps({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">करियर रोडमैप</h1>
        <p className="text-sm text-muted-foreground">कुल {total} रोडमैप</p>
      </div>

      <AdminListToolbar
        searchPlaceholder="रोडमैप खोजें..."
        defaultSearch={sp.q}
        addHref="/admin/career-roadmaps/new"
        addLabel="नया रोडमैप"
      />

      {items.length === 0 ? (
        <EmptyState icon={Compass} title="कोई रोडमैप नहीं मिला" description="नया रोडमैप जोड़ें।" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">शीर्षक</th>
                <th className="p-3">स्ट्रीम</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((roadmap) => (
                <tr key={roadmap.id}>
                  <td className="max-w-xs p-3 font-medium">{roadmap.title}</td>
                  <td className="p-3 text-muted-foreground">{roadmap.stream}</td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={roadmap.isPublished}
                      action={toggleRoadmapPublish.bind(null, roadmap.id, !roadmap.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/career-roadmaps/${roadmap.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteRoadmap.bind(null, roadmap.id)}>
                        <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस रोडमैप को हटाना चाहते हैं?" aria-label="हटाएँ">
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/career-roadmaps" searchParams={sp} />
    </div>
  );
}
