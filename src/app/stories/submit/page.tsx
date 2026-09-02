import Link from "next/link";
import { LogIn } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitStoryForm } from "@/components/stories/submit-story-form";

export default async function SubmitStoryPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <LogIn className="h-8 w-8 text-primary" aria-hidden="true" />
          <p className="font-semibold text-foreground">कहानी भेजने के लिए लॉगिन करें</p>
          <p className="text-sm text-muted-foreground">
            अपनी सफलता की कहानी साझा करने के लिए पहले अपने खाते से लॉगिन करें।
          </p>
          <Button asChild>
            <Link href="/login?callbackUrl=/stories/submit">लॉगिन करें</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return <SubmitStoryForm />;
}
