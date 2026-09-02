"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Emblem } from "@/components/layout/emblem";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/locale-provider";
import { registerStudent, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerStudent, initialState);

  useEffect(() => {
    if (state.success) router.push("/login?registered=1");
  }, [state.success, router]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-12">
      <Emblem className="h-14 w-14" />
      <Card className="mt-6 w-full p-6 sm:p-8">
        <h1 className="text-center font-sans text-2xl font-bold text-foreground">
          {t("auth.registerTitle")}
        </h1>
        <form action={formAction} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input id="name" name="name" required minLength={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobile">{t("auth.mobile")}</Label>
              <Input id="mobile" name="mobile" type="tel" required pattern="[6-9][0-9]{9}" maxLength={10} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="classLevel">{t("auth.classLevel")}</Label>
              <Select id="classLevel" name="classLevel" required defaultValue="CLASS_10">
                <option value="CLASS_9">9</option>
                <option value="CLASS_10">10</option>
                <option value="CLASS_11">11</option>
                <option value="CLASS_12">12</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block">{t("auth.block")}</Label>
              <Input id="block" name="block" required placeholder="सूरजपुर" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="school">{t("auth.school")}</Label>
            <Input id="school" name="school" required />
          </div>

          {state.error && (
            <p role="alert" className="rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-section-examdates)_15%,transparent)] px-3 py-2 text-sm text-[var(--color-section-examdates)]">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? t("common.loading") : t("auth.registerCta")}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("auth.loginCta")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
