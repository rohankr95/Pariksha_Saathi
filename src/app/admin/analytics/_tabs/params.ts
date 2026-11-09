import type { ClassLevel } from "@prisma/client";
import { isBlockValue, type BlockValue } from "@/lib/blocks";
import { VIDEO_SORTS, type VideoSort } from "@/lib/queries/analytics-reports";
import type { Granularity } from "@/lib/queries/analytics";

export const TABS = ["overview", "students", "activity", "videos", "uploads"] as const;
export type Tab = (typeof TABS)[number];

export const RANGE_PRESETS: Record<Granularity, number[]> = { day: [7, 14, 30, 90], week: [4, 8, 12, 26] };
const DEFAULT_RANGE: Record<Granularity, number> = { day: 14, week: 12 };
const CLASS_LEVELS: ClassLevel[] = ["CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"];

export type ReportParams = {
  tab: Tab;
  g: Granularity;
  n: number;
  block?: BlockValue;
  sort: VideoSort;
  cls?: ClassLevel;
  page: number;
};

export function parseReportParams(sp: Record<string, string | undefined>): ReportParams {
  const tab = (TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as Tab) : "overview";
  const g: Granularity = sp.g === "week" ? "week" : "day";
  const n = RANGE_PRESETS[g].includes(Number(sp.n)) ? Number(sp.n) : DEFAULT_RANGE[g];
  return {
    tab,
    g,
    n,
    block: isBlockValue(sp.block) ? sp.block : undefined,
    sort: (VIDEO_SORTS as readonly string[]).includes(sp.sort ?? "") ? (sp.sort as VideoSort) : "views",
    cls: CLASS_LEVELS.includes(sp.cls as ClassLevel) ? (sp.cls as ClassLevel) : undefined,
    page: Math.max(1, Number(sp.page) || 1),
  };
}

/** Builds a report URL from the current params plus overrides; `undefined` drops a param. */
export function reportHref(current: ReportParams, overrides: Partial<Record<keyof ReportParams, string | number | undefined>>) {
  const merged: Record<string, string | number | undefined> = { ...current, ...overrides };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === "") continue;
    if (k === "page" && Number(v) === 1) continue;
    if (k === "tab" && v === "overview") continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `/admin/analytics?${s}` : "/admin/analytics";
}
