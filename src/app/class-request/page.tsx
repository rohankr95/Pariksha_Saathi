import { HandHelping } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMyClassRequests, getOpenClassRequestFeed } from "@/lib/queries/class-requests";
import { getSubjects } from "@/lib/queries/curriculum";
import { ClassRequestForm } from "@/components/class-request/class-request-form";
import { MyRequestsList } from "@/components/class-request/my-requests-list";
import { RequestFeed } from "@/components/class-request/request-feed";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "कक्षा अनुरोध | परीक्षा साथी" };

export default async function ClassRequestPage() {
  const session = await auth();
  const [subjects, teachers] = await Promise.all([
    getSubjects(),
    prisma.user.findMany({
      where: { role: "TEACHER", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const isStudent = session?.user?.role === "STUDENT";
  const [myRequests, feed] = await Promise.all([
    isStudent ? getMyClassRequests(session!.user.id) : Promise.resolve([]),
    isStudent ? getOpenClassRequestFeed(session!.user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-classrequest)]/15 text-[var(--color-section-classrequest)]">
          <HandHelping className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">कक्षा अनुरोध</h1>
          <p className="text-sm text-muted-foreground">अपनी पसंदीदा कक्षा का अनुरोध करें</p>
        </div>
      </div>

      {!isStudent ? (
        <EmptyState icon={HandHelping} title="कक्षा अनुरोध भेजने के लिए विद्यार्थी के रूप में लॉगिन करें" />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <ClassRequestForm subjects={subjects} teachers={teachers} />
            {feed.length > 0 && <RequestFeed requests={feed} myId={session!.user.id} />}
          </div>
          <MyRequestsList requests={myRequests} />
        </div>
      )}
    </div>
  );
}
