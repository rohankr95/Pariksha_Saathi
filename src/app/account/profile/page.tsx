import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/account/profile-form";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { isBlockValue } from "@/lib/blocks";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "मेरी प्रोफ़ाइल | परीक्षा साथी" };

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default async function AccountProfilePage() {
  const session = await requireUser();
  const t = await getT();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      mobile: true,
      role: true,
      classLevel: true,
      school: true,
      block: true,
      displayName: true,
      onLeaderboard: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const isStudent = user.role === "STUDENT";
  const blockNotice =
    isStudent && !isBlockValue(user.block)
      ? user.block?.trim()
        ? t("account.profile.blockNotice", { block: user.block })
        : t("account.profile.blockMissing")
      : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-sans text-2xl font-bold text-foreground">{t("account.profile.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("account.profile.subtitle")}</p>

      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">{t("account.profile.role")}:</dt>
          <dd className="font-medium">{t(`account.profile.roles.${user.role}`)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">{t("account.profile.memberSince")}:</dt>
          <dd className="font-medium">{formatDate(user.createdAt)}</dd>
        </div>
      </dl>

      {blockNotice && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-section-leaderboard)_12%,transparent)] px-3 py-2.5 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-section-leaderboard)]" aria-hidden="true" />
          {blockNotice}
        </p>
      )}

      <Card className="mt-5 p-6">
        <ProfileForm
          initial={{
            isStudent,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            classLevel: user.classLevel,
            school: user.school,
            block: user.block,
            displayName: user.displayName,
            onLeaderboard: user.onLeaderboard,
          }}
        />
      </Card>

      <Link
        href="/account/security"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        {t("account.menuLink")}
      </Link>
    </div>
  );
}
