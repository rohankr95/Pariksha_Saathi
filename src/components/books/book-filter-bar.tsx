import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { BOOK_CATEGORY_LABEL } from "@/lib/book-categories";
import { getT } from "@/lib/i18n/server";
import type { ClassLevel, BookCategory, Subject } from "@prisma/client";

const LANGUAGE_OPTIONS = ["HINDI", "ENGLISH"] as const;

export async function BookFilterBar({
  subjects,
  current,
}: {
  subjects: Subject[];
  current: { category?: string; classLevel?: string; subjectId?: string; medium?: string; q?: string };
}) {
  const t = await getT();
  return (
    <form className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" action="/books">
      <Input
        type="search"
        name="q"
        defaultValue={current.q}
        placeholder={t("books.filter.searchPlaceholder")}
        className="col-span-2"
      />
      <Select name="category" defaultValue={current.category ?? ""}>
        <option value="">{t("books.filter.allCategories")}</option>
        {(Object.keys(BOOK_CATEGORY_LABEL) as BookCategory[]).map((c) => (
          <option key={c} value={c}>
            {t(`books.category.${c}`)}
          </option>
        ))}
      </Select>
      <Select name="classLevel" defaultValue={current.classLevel ?? ""}>
        <option value="">{t("books.filter.allClasses")}</option>
        {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((c) => (
          <option key={c} value={c}>
            {CLASS_LEVEL_LABEL[c]}
          </option>
        ))}
      </Select>
      <Select name="subjectId" defaultValue={current.subjectId ?? ""}>
        <option value="">{t("books.filter.allSubjects")}</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nameHi}
          </option>
        ))}
      </Select>
      <Select name="medium" defaultValue={current.medium ?? ""} className="col-span-2 sm:col-span-1">
        <option value="">{t("books.filter.allMediums")}</option>
        {LANGUAGE_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {t(`books.language.${value.toLowerCase()}`)}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="outline">
        {t("books.filter.apply")}
      </Button>
    </form>
  );
}
