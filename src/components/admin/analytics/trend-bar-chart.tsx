import type { TrendPoint } from "@/lib/queries/analytics";
import { formatShortDate } from "./format-date";

const WIDTH = 520;
const HEIGHT = 160;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;
const GAP = 4;

/** A single-series bar chart with per-bar hover (native title) — no dependency, hand-authored SVG. */
export function TrendBarChart({
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
  const barW = data.length > 0 ? (plotW - GAP * (data.length - 1)) / data.length : 0;
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
        {data.map((d, i) => {
          const barH = (d.count / max) * plotH;
          const x = PAD_X + i * (barW + GAP);
          const y = PAD_TOP + plotH - barH;
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barW} height={Math.max(barH, 2)} rx={Math.min(4, barW / 2)} fill="currentColor">
                <title>{`${formatShortDate(d.date)}: ${d.count}`}</title>
              </rect>
              {(i % labelEvery === 0 || i === data.length - 1) && (
                <text
                  x={x + barW / 2}
                  y={HEIGHT - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--muted-foreground)"
                  className="font-sans"
                >
                  {formatShortDate(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
