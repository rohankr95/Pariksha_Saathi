import Link from "next/link";
import { Pencil, Trash2, CalendarClock } from "lucide-react";
import { getAdminExams } from "@/lib/queries/admin-exams";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { computeExamStatus, EXAM_STATUS_LABEL, formatIST } from "@/lib/exam-status";
import { toggleExamPublish, deleteExam } from "./actions";

export default async function AdminExamDatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminExams({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">परीक्षा तिथि</h1>
        <p className="text-sm text-muted-foreground">कुल {total} परीक्षाएँ</p>
      </div>

      <AdminListToolbar
        searchPlaceholder="परीक्षा खोजें..."
        defaultSearch={sp.q}
        addHref="/admin/exam-dates/new"
        addLabel="नई परीक्षा"
      />

      {items.length === 0 ? (
        <EmptyState icon={CalendarClock} title="कोई परीक्षा नहीं मिली" description="नई परीक्षा जोड़ें।" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">परीक्षा</th>
                <th className="p-3">आवेदन अंतिम तिथि</th>
                <th className="p-3">स्थिति (स्वतः)</th>
                <th className="p-3">प्रकाशन</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((exam) => (
                <tr key={exam.id}>
                  <td className="max-w-xs p-3 font-medium">
                    {exam.name}
                    <br />
                    <span className="text-xs text-muted-foreground">{exam.category}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatIST(exam.applyEnd)}</td>
                  <td className="p-3 text-muted-foreground">{EXAM_STATUS_LABEL[computeExamStatus(exam)]}</td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={exam.isPublished}
                      action={toggleExamPublish.bind(null, exam.id, !exam.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/exam-dates/${exam.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteExam.bind(null, exam.id)}>
                        <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस परीक्षा को हटाना चाहते हैं?" aria-label="हटाएँ">
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/exam-dates" searchParams={sp} />
    </div>
  );
}
