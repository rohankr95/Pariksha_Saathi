import { getT } from "@/lib/i18n/server";

export default async function PrivacyPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose">
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("legal.privacyTitle")}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{t("legal.privacyBody")}</p>
    </div>
  );
}
