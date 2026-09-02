import hi from "./dictionaries/hi.json";
import en from "./dictionaries/en.json";

export type Locale = "hi" | "en";
export const LOCALE_COOKIE = "ps_locale";
export const DEFAULT_LOCALE: Locale = "hi";

export const dictionaries = { hi, en } as const;

export type Dictionary = typeof hi;

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** Translate a dotted key, e.g. t(dict, "home.greeting", { name: "Ravi" }) */
export function translate(
  dict: Dictionary,
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw = getByPath(dict, key);
  let str = typeof raw === "string" ? raw : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
