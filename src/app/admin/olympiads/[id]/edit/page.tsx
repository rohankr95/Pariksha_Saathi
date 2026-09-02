import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OlympiadForm } from "@/components/admin/olympiad-form";
import { updateOlympiad } from "../../actions";

export default async function EditOlympiadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const olympiad = await prisma.olympiad.findUnique({ where: { id } });
  if (!olympiad) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">ओलंपियाड संपादित करें</h1>
      <OlympiadForm initial={olympiad} action={updateOlympiad.bind(null, id)} />
    </div>
  );
}
