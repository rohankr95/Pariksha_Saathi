"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/app/lectures/actions";

export function ViewTracker({ lectureId }: { lectureId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    recordView(lectureId);
  }, [lectureId]);
  return null;
}
