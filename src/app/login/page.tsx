"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Emblem } from "@/components/layout/emblem";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/locale-provider";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t("auth.invalidCredentials"));
      return;
    }
    router.push(searchParams.get("callbackUrl") || "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <Emblem className="h-14 w-14" />
      <Card className="mt-6 w-full p-6 sm:p-8">
        <h1 className="text-center font-sans text-2xl font-bold text-foreground">
          {t("auth.loginTitle")}
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-section-examdates)_15%,transparent)] px-3 py-2 text-sm text-[var(--color-section-examdates)]">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t("common.loading") : t("auth.loginCta")}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t("auth.registerCta")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
