import type { TrendPoint } from "@/lib/queries/analytics";
import { formatShortDate } from "./format-date";

const WIDTH = 520;
const HEIGHT = 160;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

/** A single-series line chart with per-point hover (native title) — no dependency, hand-authored SVG. */
export function TrendLineChart({
  data,
  color,
  caption,
}: {
  data: TrendPoint[];
  color: string;
  caption: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const plotW = WIDTH - PAD_X * 2;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_TOP + plotH - (d.count / max) * plotH,
    ...d,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x.toFixed(1) ?? 0},${PAD_TOP + plotH} L${PAD_X},${PAD_TOP + plotH} Z`;

  // Label every ~4th point plus the last, so labels never collide.
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <figure className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={caption}
        style={{ width: "100%", height: "auto", color }}
      >
        <line x1={PAD_X} y1={PAD_TOP + plotH} x2={WIDTH - PAD_X} y2={PAD_TOP + plotH} stroke="var(--border)" strokeWidth="1" />
        <path d={areaPath} fill="currentColor" opacity="0.08" stroke="none" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={p.date}>
            <circle cx={p.x} cy={p.y} r="8" fill="transparent">
              <title>{`${formatShortDate(p.date)}: ${p.count}`}</title>
            </circle>
            <circle cx={p.x} cy={p.y} r="3" fill="currentColor" />
            {(i % labelEvery === 0 || i === points.length - 1) && (
              <text
                x={p.x}
                y={HEIGHT - 6}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted-foreground)"
                className="font-sans"
              >
                {formatShortDate(p.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
