import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TopperForm } from "@/components/admin/topper-form";
import { updateTopper } from "../../actions";
import { getT } from "@/lib/i18n/server";

export default async function EditTopperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topper = await prisma.topper.findUnique({ where: { id } });
  if (!topper) notFound();
  const t = await getT();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("toppers.admin.editTitle")}</h1>
      <TopperForm initial={topper} action={updateTopper.bind(null, id)} />
    </div>
  );
}
