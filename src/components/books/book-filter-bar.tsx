import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import { BOOK_CATEGORY_LABEL } from "@/lib/book-categories";
import type { ClassLevel, BookCategory, Subject } from "@prisma/client";

const LANGUAGE_LABEL: Record<string, string> = { HINDI: "हिंदी", ENGLISH: "English" };

export function BookFilterBar({
  subjects,
  current,
}: {
  subjects: Subject[];
  current: { category?: string; classLevel?: string; subjectId?: string; medium?: string; q?: string };
}) {
  return (
    <form className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" action="/books">
      <Input
        type="search"
        name="q"
        defaultValue={current.q}
        placeholder="पुस्तक खोजें..."
        className="col-span-2"
      />
      <Select name="category" defaultValue={current.category ?? ""}>
        <option value="">सभी श्रेणियाँ</option>
        {(Object.keys(BOOK_CATEGORY_LABEL) as BookCategory[]).map((c) => (
          <option key={c} value={c}>
            {BOOK_CATEGORY_LABEL[c]}
          </option>
        ))}
      </Select>
      <Select name="classLevel" defaultValue={current.classLevel ?? ""}>
        <option value="">सभी कक्षाएँ</option>
        {(Object.keys(CLASS_LEVEL_LABEL) as ClassLevel[]).map((c) => (
          <option key={c} value={c}>
            {CLASS_LEVEL_LABEL[c]}
          </option>
        ))}
      </Select>
      <Select name="subjectId" defaultValue={current.subjectId ?? ""}>
        <option value="">सभी विषय</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nameHi}
          </option>
        ))}
      </Select>
      <Select name="medium" defaultValue={current.medium ?? ""} className="col-span-2 sm:col-span-1">
        <option value="">सभी माध्यम</option>
        {Object.entries(LANGUAGE_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="outline">
        फ़िल्टर लागू करें
      </Button>
    </form>
  );
}
