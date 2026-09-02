"use client";

import { useActionState } from "react";
import { CheckCircle2, PenLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitStory, type SubmitStoryState } from "@/app/stories/submit/actions";

const initialState: SubmitStoryState = {};

export function SubmitStoryForm() {
  const [state, formAction, pending] = useActionState(submitStory, initialState);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-section-stories)]/15 text-[var(--color-section-stories)]">
          <PenLine className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">अपनी कहानी भेजें</h1>
          <p className="text-sm text-muted-foreground">
            आपकी कहानी समीक्षा के बाद प्रकाशित की जाएगी
          </p>
        </div>
      </div>

      {state.success ? (
        <Card className="flex items-center gap-3 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
          <p className="text-sm">
            धन्यवाद! आपकी कहानी सफलतापूर्वक भेज दी गई है और समीक्षा के लिए लंबित है।
          </p>
        </Card>
      ) : (
        <Card className="p-5 sm:p-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">शीर्षक</Label>
              <Input id="title" name="title" required minLength={3} placeholder="मेरी सफलता की कहानी" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">आपकी कहानी</Label>
              <Textarea
                id="body"
                name="body"
                required
                minLength={20}
                rows={8}
                placeholder="अपनी यात्रा, संघर्ष और सफलता के बारे में लिखें..."
              />
            </div>
            {state.error && (
              <p role="alert" className="text-sm text-[var(--color-section-examdates)]">
                {state.error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "भेजा जा रहा है..." : "कहानी भेजें"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
