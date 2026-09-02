import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export function AdminComingSoon({
  icon,
  titleHi,
  titleEn,
  phase,
}: {
  icon: LucideIcon;
  titleHi: string;
  titleEn: string;
  phase: string;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">{titleHi}</h1>
          <p className="text-sm text-muted-foreground">{titleEn}</p>
        </div>
        <Badge variant="accent">{phase}</Badge>
      </div>
      <EmptyState
        icon={icon}
        title="इस मॉड्यूल का पूर्ण प्रबंधन जल्द आ रहा है"
        description="इस चरण में केवल डेटाबेस संरचना और नेविगेशन तैयार है। पूर्ण CRUD आगामी चरण में जोड़ा जाएगा।"
      />
    </div>
  );
}
