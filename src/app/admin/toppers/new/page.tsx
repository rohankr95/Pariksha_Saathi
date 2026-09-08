import { TopperForm } from "@/components/admin/topper-form";
import { createTopper } from "../actions";
import { getT } from "@/lib/i18n/server";

export default async function NewTopperPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("toppers.admin.newTitle")}</h1>
      <TopperForm action={createTopper} />
    </div>
  );
}
