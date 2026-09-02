"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";

const DISMISS_KEY = "ps_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-3 shadow-[var(--shadow-card)] md:bottom-4">
      <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <p className="flex-1 text-xs text-foreground">{t("pwa.installPrompt")}</p>
      <Button size="sm" onClick={install}>
        {t("pwa.install")}
      </Button>
      <button onClick={dismiss} aria-label={t("pwa.dismiss")} className="rounded-full p-1 text-muted-foreground hover:bg-surface-muted">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
