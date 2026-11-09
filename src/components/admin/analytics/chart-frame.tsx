"use client";

import { useRef, useState } from "react";

import type { TipPayload } from "./chart-utils";

type TipState = TipPayload & { x: number; y: number; width: number };

/**
 * Hover/focus tooltip for server-rendered SVG charts: any descendant with a
 * `data-tip` attribute becomes a target. Values lead, labels follow; series
 * are keyed with a short line in the series colour.
 */
export function ChartFrame({ children, caption }: { children: React.ReactNode; caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  function showFor(target: EventTarget | null, clientX?: number, clientY?: number) {
    const el = target instanceof Element ? target.closest("[data-tip]") : null;
    const box = ref.current?.getBoundingClientRect();
    if (!el || !box) return setTip(null);
    let payload: TipPayload;
    try {
      payload = JSON.parse(el.getAttribute("data-tip") ?? "");
    } catch {
      return setTip(null);
    }
    const markBox = el.getBoundingClientRect();
    const x = (clientX ?? markBox.left + markBox.width / 2) - box.left;
    const y = (clientY ?? markBox.top) - box.top;
    setTip({ ...payload, x, y, width: box.width });
  }

  const flip = tip ? tip.x > tip.width - 170 : false;

  return (
    <figure className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div
        ref={ref}
        className="relative"
        onPointerMove={(e) => showFor(e.target, e.clientX, e.clientY)}
        onPointerLeave={() => setTip(null)}
        onFocus={(e) => showFor(e.target)}
        onBlur={() => setTip(null)}
      >
        {children}
        {tip && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 min-w-[120px] rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-2 text-xs shadow-[var(--shadow-card)]"
            style={{
              left: flip ? undefined : tip.x + 12,
              right: flip ? tip.width - tip.x + 12 : undefined,
              top: Math.max(0, tip.y - 12),
            }}
          >
            <p className="mb-1 text-muted-foreground">{tip.t}</p>
            {tip.r.map((row) => (
              <p key={row.l} className="flex items-center gap-2">
                {row.c && <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: row.c }} aria-hidden="true" />}
                <span className="font-semibold text-foreground">{row.v}</span>
                <span className="text-muted-foreground">{row.l}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
