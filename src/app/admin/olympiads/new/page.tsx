import { OlympiadForm } from "@/components/admin/olympiad-form";
import { getT } from "@/lib/i18n/server";
import { createOlympiad } from "../actions";

export default async function NewOlympiadPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("olympiad.admin.newTitle")}</h1>
      <OlympiadForm action={createOlympiad} />
    </div>
  );
}
