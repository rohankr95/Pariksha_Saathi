import { getT } from "@/lib/i18n/server";

export default async function HelpPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("legal.helpTitle")}</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {t("legal.helpBody", { number: process.env.NEXT_PUBLIC_HELPLINE_NUMBER ?? "1800-XXX-XXXX" })}
      </p>
    </div>
  );
}
