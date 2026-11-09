import type { TrendPoint } from "@/lib/queries/analytics";
import { ChartFrame } from "./chart-frame";
import { formatCount, niceScale, tipAttr } from "./chart-utils";
import { formatPeriod, formatShortDate } from "./format-date";

const HEIGHT = 180;
const PAD_LEFT = 34;
const PAD_RIGHT = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 22;
const MAX_BAR = 24;
const RADIUS = 4;

/** Column path with a rounded data-end and a square base on the baseline. */
function columnPath(x: number, w: number, top: number, base: number) {
  const r = Math.min(RADIUS, w / 2, base - top);
  return `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${base} Z`;
}

/** Single-series columns over time: capped bar width, per-bar tooltip, the latest value labelled. */
export function TrendBarChart({
  data,
  color,
  caption,
  valueLabel,
  weekly = false,
  wide = false,
}: {
  data: TrendPoint[];
  color: string;
  caption: string;
  valueLabel: string;
  weekly?: boolean;
  /** Full-width placement: a wider canvas keeps text at the same visual size. */
  wide?: boolean;
}) {
  const WIDTH = wide ? 1000 : 560;
  const scale = niceScale(Math.max(0, ...data.map((d) => d.count)));
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const base = PAD_TOP + plotH;
  const slot = data.length > 0 ? plotW / data.length : plotW;
  const barW = Math.min(MAX_BAR, slot * 0.7);
  const y = (v: number) => base - (v / scale.max) * plotH;
  const ticks = Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, i) => i * scale.step);
  const labelEvery = Math.max(1, Math.ceil(data.length / (wide ? 10 : 6)));

  return (
    <ChartFrame caption={caption}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full" style={{ color }}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD_LEFT - 6} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
              {formatCount(tick)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = PAD_LEFT + i * slot + slot / 2;
          const top = y(d.count);
          const isLast = i === data.length - 1;
          return (
            <g key={d.date} className="group">
              {d.count > 0 && (
                <path
                  d={columnPath(cx - barW / 2, barW, top, base)}
                  fill="currentColor"
                  className="transition-opacity group-hover:opacity-80 group-focus:opacity-80"
                />
              )}
              {isLast && (
                <text x={cx} y={top - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--foreground)">
                  {d.count}
                </text>
              )}
              {(i % labelEvery === 0 || isLast) && (
                <text x={cx} y={HEIGHT - 6} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
                  {formatShortDate(d.date)}
                </text>
              )}
              <rect
                x={cx - slot / 2}
                y={PAD_TOP}
                width={slot}
                height={plotH}
                fill="transparent"
                tabIndex={0}
                aria-label={`${formatPeriod(d.date, weekly)}: ${d.count}`}
                data-tip={tipAttr({ t: formatPeriod(d.date, weekly), r: [{ l: valueLabel, v: String(d.count), c: color }] })}
                className="outline-none"
              />
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
