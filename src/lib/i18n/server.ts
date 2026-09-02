import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dictionaries, translate, type Locale } from "./index";

/** Reads the visitor's locale preference from the cookie set by LanguageToggle. Usable in Server Components and Server Actions. */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

/** Server-side equivalent of useLocale().t — for Server Components that fetch data and can't use the client hook. */
export async function getT() {
  const locale = await getServerLocale();
  return (key: string, vars?: Record<string, string | number>) => translate(dictionaries[locale], key, vars);
}
