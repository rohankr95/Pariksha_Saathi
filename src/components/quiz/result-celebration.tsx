"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["var(--color-section-quiz)", "var(--color-accent)", "var(--color-section-lectures)", "var(--color-success)", "var(--color-section-stories)"];

export function ResultCelebration({ accuracy }: { accuracy: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: accuracy >= 70 ? 24 : 0 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
    }))
  );

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: `${p.left}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "100vh", opacity: 0, rotate: p.rotate }}
          transition={{ duration: 1.8, delay: p.delay, ease: "easeIn" }}
          className="absolute top-0 block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
