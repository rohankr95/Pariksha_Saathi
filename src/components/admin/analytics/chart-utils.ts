/** Payload a chart mark carries in its `data-tip` attribute (read by ChartFrame). */
export type TipPayload = { t: string; r: { l: string; v: string; c?: string }[] };

export function tipAttr(payload: TipPayload) {
  return JSON.stringify(payload);
}

/** A clean axis maximum and tick step (1/2/5 × 10ⁿ) covering `max` in about `ticks` steps. */
export function niceScale(max: number, ticks = 4): { max: number; step: number } {
  if (max <= 0) return { max: 1, step: 1 };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const niceStep = Math.max(1, step);
  return { max: Math.ceil(max / niceStep) * niceStep, step: niceStep };
}

export function formatCount(v: number): string {
  if (v >= 10000) return `${Math.round(v / 1000)}K`;
  return String(v);
}
