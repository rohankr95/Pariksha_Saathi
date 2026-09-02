import { Medal } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOlympiads, getInterestedOlympiadIds } from "@/lib/queries/olympiads";
import { OlympiadCard } from "@/components/olympiad/olympiad-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "ओलंपियाड | परीक्षा साथी" };

export default async function OlympiadPage() {
  const session = await auth();
  const [items, interestedIds] = await Promise.all([
    getOlympiads(),
    session?.user?.role === "STUDENT" ? getInterestedOlympiadIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-olympiad)]/15 text-[var(--color-section-olympiad)]">
          <Medal className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">ओलंपियाड</h1>
          <p className="text-sm text-muted-foreground">राष्ट्रीय व राज्य स्तरीय ओलंपियाड जानकारी</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((olympiad) => (
            <OlympiadCard
              key={olympiad.id}
              olympiad={olympiad}
              isStudent={session?.user?.role === "STUDENT"}
              interested={interestedIds.has(olympiad.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Medal} title="कोई ओलंपियाड उपलब्ध नहीं है" description="जल्द ही जानकारी जोड़ी जाएगी।" />
      )}
    </div>
  );
}
