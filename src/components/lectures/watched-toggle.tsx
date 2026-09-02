"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWatched } from "@/app/lectures/actions";

export function WatchedToggle({
  lectureId,
  initialWatched,
}: {
  lectureId: string;
  initialWatched: boolean;
}) {
  const [watched, setWatched] = useState(initialWatched);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={watched ? "outline" : "primary"}
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !watched;
          setWatched(next);
          await toggleWatched(lectureId, next);
        })
      }
    >
      {watched ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-success" /> देखा गया
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" /> देखा गया के रूप में चिह्नित करें
        </>
      )}
    </Button>
  );
}
