import type { TrendPoint } from "@/lib/queries/analytics";
import { ChartFrame } from "./chart-frame";
import { formatCount, niceScale, tipAttr } from "./chart-utils";
import { formatPeriod, formatShortDate } from "./format-date";

const HEIGHT = 180;
const PAD_LEFT = 34;
const PAD_RIGHT = 28;
const PAD_TOP = 14;
const PAD_BOTTOM = 22;

/** Single-series line over time: hairline grid, crosshair + tooltip per period, latest value labelled. */
export function TrendLineChart({
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
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;
  const y = (v: number) => PAD_TOP + plotH - (v / scale.max) * plotH;

  const points = data.map((d, i) => ({ x: PAD_LEFT + i * stepX, y: y(d.count), ...d }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const areaPath = last ? `${linePath} L${last.x.toFixed(1)},${PAD_TOP + plotH} L${PAD_LEFT},${PAD_TOP + plotH} Z` : "";
  const ticks = Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, i) => i * scale.step);
  const labelEvery = Math.max(1, Math.ceil(data.length / (wide ? 10 : 6)));
  const slotW = data.length > 1 ? stepX : plotW;

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
        <path d={areaPath} fill="currentColor" opacity="0.1" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={p.date} className="group">
            <line
              x1={p.x}
              x2={p.x}
              y1={PAD_TOP}
              y2={PAD_TOP + plotH}
              stroke="var(--muted-foreground)"
              strokeWidth="1"
              className="opacity-0 group-hover:opacity-60 group-focus:opacity-60"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="currentColor"
              stroke="var(--surface)"
              strokeWidth="2"
              className={i === points.length - 1 ? "" : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"}
            />
            {(i % labelEvery === 0 || i === points.length - 1) && (
              <text x={p.x} y={HEIGHT - 6} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
                {formatShortDate(p.date)}
              </text>
            )}
            <rect
              x={p.x - slotW / 2}
              y={PAD_TOP}
              width={slotW}
              height={plotH}
              fill="transparent"
              tabIndex={0}
              aria-label={`${formatPeriod(p.date, weekly)}: ${p.count}`}
              data-tip={tipAttr({ t: formatPeriod(p.date, weekly), r: [{ l: valueLabel, v: String(p.count), c: color }] })}
              className="outline-none"
            />
          </g>
        ))}
        {last && (
          <text x={last.x + 7} y={last.y + 3} fontSize="11" fontWeight="600" fill="var(--foreground)">
            {last.count}
          </text>
        )}
      </svg>
    </ChartFrame>
  );
}
