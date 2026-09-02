import Link from "next/link";
import { Pencil, Trash2, Lightbulb, ListChecks } from "lucide-react";
import { getAdminQuizzes } from "@/lib/queries/admin-quizzes";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPagination } from "@/components/admin/pagination";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { toggleQuizPublish, deleteQuiz } from "./actions";

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const { items, total, totalPages } = await getAdminQuizzes({ q: sp.q, page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-foreground">प्रश्नोत्तरी</h1>
        <p className="text-sm text-muted-foreground">कुल {total} प्रश्नोत्तरी</p>
      </div>

      <AdminListToolbar
        searchPlaceholder="प्रश्नोत्तरी खोजें..."
        defaultSearch={sp.q}
        addHref="/admin/quizzes/new"
        addLabel="नई प्रश्नोत्तरी"
      />

      {items.length === 0 ? (
        <EmptyState icon={Lightbulb} title="कोई प्रश्नोत्तरी नहीं मिली" description="नई प्रश्नोत्तरी बनाएँ।" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">शीर्षक</th>
                <th className="p-3">विषय</th>
                <th className="p-3">प्रश्न / प्रयास</th>
                <th className="p-3">स्थिति</th>
                <th className="p-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="max-w-xs p-3 font-medium">
                    {quiz.title}
                    {quiz._count.questions === 0 && (
                      <Badge variant="accent" className="ml-2 text-[10px]">
                        कोई प्रश्न नहीं
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {quiz.subject.nameHi}
                    {quiz.chapter && <><br /><span className="text-xs">{quiz.chapter.nameHi}</span></>}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {quiz._count.questions} प्रश्न · {quiz._count.attempts} प्रयास
                  </td>
                  <td className="p-3">
                    <PublishToggle
                      isPublished={quiz.isPublished}
                      action={toggleQuizPublish.bind(null, quiz.id, !quiz.isPublished)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/quizzes/${quiz.id}/questions`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label="प्रश्न प्रबंधित करें"
                        title="प्रश्न प्रबंधित करें"
                      >
                        <ListChecks className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/quizzes/${quiz.id}/edit`}
                        className="rounded-[var(--radius-sm)] p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
                        aria-label="संपादित करें"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteQuiz.bind(null, quiz.id)}>
                        <ConfirmSubmitButton confirmMessage="क्या आप वाकई इस प्रश्नोत्तरी को हटाना चाहते हैं?" aria-label="हटाएँ">
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

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/quizzes" searchParams={sp} />
    </div>
  );
}
