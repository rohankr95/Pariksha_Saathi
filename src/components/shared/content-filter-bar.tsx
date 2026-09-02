import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASS_LEVEL_LABEL } from "@/lib/queries/curriculum";
import type { ClassLevel, Subject, Chapter } from "@prisma/client";

const LANGUAGE_LABEL: Record<string, string> = {
  HINDI: "हिंदी",
  ENGLISH: "English",
  CHHATTISGARHI: "छत्तीसगढ़ी",
};

export function ContentFilterBar({
  action,
  subjects,
  chapters,
  tags,
  searchPlaceholder,
  current,
}: {
  action: string;
  subjects: Subject[];
  chapters: Chapter[];
  tags?: readonly string[];
  searchPlaceholder: string;
  current: {
    classLevel?: string;
    subjectId?: string;
    chapterId?: string;
    language?: string;
    tag?: string;
    q?: string;
  };
}) {
  return (
    <form className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6" action={action}>
      <Input
        type="search"
        name="q"
        defaultValue={current.q}
        placeholder={searchPlaceholder}
        className="col-span-2 lg:col-span-2"
      />
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
      <Select name="chapterId" defaultValue={current.chapterId ?? ""}>
        <option value="">सभी अध्याय</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nameHi}
          </option>
        ))}
      </Select>
      <Select name="language" defaultValue={current.language ?? ""}>
        <option value="">सभी भाषाएँ</option>
        {Object.entries(LANGUAGE_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {tags && tags.length > 0 && (
        <div className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-3 lg:col-span-6">
          <label className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary">
            <input type="radio" name="tag" value="" defaultChecked={!current.tag} className="sr-only" />
            सभी टैग
          </label>
          {tags.map((tag) => (
            <label
              key={tag}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
            >
              <input
                type="radio"
                name="tag"
                value={tag}
                defaultChecked={current.tag === tag}
                className="sr-only"
              />
              {tag}
            </label>
          ))}
          <Button type="submit" size="sm" variant="outline" className="ml-auto">
            फ़िल्टर लागू करें
          </Button>
        </div>
      )}
      {(!tags || tags.length === 0) && (
        <div className="col-span-2 sm:col-span-1">
          <Button type="submit" size="sm" variant="outline" className="w-full">
            फ़िल्टर लागू करें
          </Button>
        </div>
      )}
    </form>
  );
}
