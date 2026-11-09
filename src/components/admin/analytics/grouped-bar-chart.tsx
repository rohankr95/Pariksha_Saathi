import { ChartFrame } from "./chart-frame";
import { formatCount, niceScale, tipAttr } from "./chart-utils";

export type GroupedSeries = { key: string; label: string; color: string };
export type GroupedCategory = { label: string; values: Record<string, number> };

const WIDTH = 880;
const LABEL_W = 110;
const PAD_RIGHT = 36;
const PAD_TOP = 4;
const AXIS_H = 20;
const BAR = 14;
const GAP = 2;
const BAND_PAD = 14;
const RADIUS = 4;

/** Bar path with a rounded data-end (right) and a square base on the axis (left). */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, w, h / 2);
  return `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`;
}

/** Horizontal grouped bars: one band per category, one bar per series, legend above, values at the tips. */
export function GroupedBarChart({
  categories,
  series,
  caption,
}: {
  categories: GroupedCategory[];
  series: GroupedSeries[];
  caption: string;
}) {
  const max = Math.max(0, ...categories.flatMap((c) => series.map((s) => c.values[s.key] ?? 0)));
  const scale = niceScale(max, 4);
  const bandH = series.length * BAR + (series.length - 1) * GAP + BAND_PAD;
  const plotW = WIDTH - LABEL_W - PAD_RIGHT;
  const height = PAD_TOP + categories.length * bandH + AXIS_H;
  const x = (v: number) => LABEL_W + (v / scale.max) * plotW;
  const ticks = Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, i) => i * scale.step);
  const axisY = PAD_TOP + categories.length * bandH;

  return (
    <ChartFrame caption={caption}>
      <ul className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: s.color }} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1={PAD_TOP} y2={axisY} stroke="var(--border)" strokeWidth="1" />
            <text x={x(tick)} y={axisY + 14} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
              {formatCount(tick)}
            </text>
          </g>
        ))}
        {categories.map((c, ci) => {
          const bandTop = PAD_TOP + ci * bandH + BAND_PAD / 2;
          return (
            <g key={c.label} className="group">
              <text
                x={LABEL_W - 8}
                y={bandTop + (bandH - BAND_PAD) / 2 + 4}
                textAnchor="end"
                fontSize="12"
                fill="var(--foreground)"
              >
                {c.label}
              </text>
              {series.map((s, si) => {
                const v = c.values[s.key] ?? 0;
                const by = bandTop + si * (BAR + GAP);
                const w = x(v) - LABEL_W;
                return (
                  <g key={s.key}>
                    {v > 0 && (
                      <path
                        d={barPath(LABEL_W, by, w, BAR)}
                        fill={s.color}
                        className="transition-opacity group-hover:opacity-80 group-focus:opacity-80"
                      />
                    )}
                    <text x={LABEL_W + w + 5} y={by + BAR - 2} fontSize="10" fill="var(--muted-foreground)">
                      {v}
                    </text>
                  </g>
                );
              })}
              <rect
                x={0}
                y={bandTop - BAND_PAD / 2}
                width={WIDTH}
                height={bandH}
                fill="transparent"
                tabIndex={0}
                aria-label={`${c.label}: ${series.map((s) => `${s.label} ${c.values[s.key] ?? 0}`).join(", ")}`}
                data-tip={tipAttr({
                  t: c.label,
                  r: series.map((s) => ({ l: s.label, v: String(c.values[s.key] ?? 0), c: s.color })),
                })}
                className="outline-none"
              />
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
