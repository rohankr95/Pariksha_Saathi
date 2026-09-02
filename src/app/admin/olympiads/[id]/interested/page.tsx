import { notFound } from "next/navigation";
import { getOlympiadInterestList } from "@/lib/queries/admin-olympiads";
import { EmptyState } from "@/components/ui/empty-state";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { Users } from "lucide-react";

export default async function OlympiadInterestedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { olympiad, interests } = await getOlympiadInterestList(id);
  if (!olympiad) notFound();

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-foreground">{olympiad.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        रुचि पंजीकृत करने वाले विद्यार्थी ({interests.length}) — विद्यालयवार सूची फेलिसिटेशन/समन्वय हेतु
      </p>

      {interests.length === 0 ? (
        <EmptyState icon={Users} title="अभी तक किसी ने रुचि पंजीकृत नहीं की है" />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">नाम</th>
                <th className="p-3">कक्षा</th>
                <th className="p-3">विद्यालय</th>
                <th className="p-3">विकासखंड</th>
                <th className="p-3">मोबाइल</th>
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
