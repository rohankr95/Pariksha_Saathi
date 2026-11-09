// The six development blocks of Surajpur district. `value` is what gets
// stored in User.block (a free-text column, so no schema change is needed to
// restrict it); `en` is shown when the UI is in English.
export const BLOCKS = [
  { value: "सूरजपुर", en: "Surajpur", aliases: ["surajpur", "soorajpur", "surajpura", "सुरजपुर"] },
  { value: "भैयाथान", en: "Bhaiyathan", aliases: ["bhaiyathan", "bhaiyathana", "bhaiyathaan", "bhaiyatan", "bhaiythan", "भइयाथान", "भैयाथाना"] },
  { value: "प्रतापपुर", en: "Pratappur", aliases: ["pratappur", "prattapur", "pratapur", "partappur", "pratappura"] },
  { value: "रामानुजनगर", en: "Ramanujnagar", aliases: ["ramanujnagar", "ramanujanagar", "ramanujnager", "रामानुजनगर"] },
  { value: "ओड़गी", en: "Odgi", aliases: ["odgi", "odagi", "oadgi", "odgee", "orgi"] },
  { value: "प्रेमनगर", en: "Premnagar", aliases: ["premnagar", "premnager"] },
] as const;

export type BlockValue = (typeof BLOCKS)[number]["value"];

export const BLOCK_VALUES = BLOCKS.map((b) => b.value) as [BlockValue, ...BlockValue[]];

export function isBlockValue(v: string | null | undefined): v is BlockValue {
  return !!v && (BLOCK_VALUES as readonly string[]).includes(v);
}

export function blockLabel(value: string | null | undefined, locale: "hi" | "en"): string {
  if (!value) return "—";
  const block = BLOCKS.find((b) => b.value === value);
  if (!block) return value;
  return locale === "en" ? block.en : block.value;
}

// Strips spacing, punctuation, the nukta (so ओड़गी == ओडगी) and words like
// "block"/"विकासखंड" that people append, so variants compare equal.
function squash(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFC")
    .replace(/़/g, "")
    .replace(/(block|blk|vikaskhand|vikas khand|विकासखंड|विकासखण्ड|ब्लॉक|ब्लाक|जनपद|janpad)/g, "")
    .replace(/[\s.,\-_/()]+/g, "");
}

const LOOKUP: { key: string; value: BlockValue }[] = BLOCKS.flatMap((b) =>
  [b.value, b.en, ...b.aliases].map((a) => ({ key: squash(a), value: b.value as BlockValue }))
);

/** Maps a legacy free-text block to one of the six blocks, or null if it can't be matched confidently. */
export function normalizeBlock(raw: string | null | undefined): BlockValue | null {
  if (!raw) return null;
  const key = squash(raw);
  if (!key) return null;
  return LOOKUP.find((l) => l.key === key)?.value ?? null;
}

/**
 * Last-resort guess from a school name like "शासकीय उमा विद्यालय, प्रतापपुर":
 * returns a block only when exactly one block's name appears in it.
 */
export function inferBlockFromText(text: string | null | undefined): BlockValue | null {
  if (!text) return null;
  const hay = squash(text);
  const hits = new Set(LOOKUP.filter((l) => l.key.length >= 4 && hay.includes(l.key)).map((l) => l.value));
  return hits.size === 1 ? [...hits][0] : null;
}
