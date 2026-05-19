"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallButton() {
  const { t, locale } = useLocale();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);

    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS-specific
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsIOS(ios && !standalone);
    if (standalone) setInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 px-3 py-2.5 text-center text-xs text-success">
        ✅ {locale === "ru" ? "Приложение установлено" : "App installed"}
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="rounded-2xl border border-border/60 bg-surface/30 p-3 text-xs leading-relaxed text-muted">
        <p className="mb-1 font-medium text-text">
          {locale === "ru" ? "Установить на iPhone" : "Install on iPhone"}
        </p>
        <p>
          {locale === "ru"
            ? "Нажми кнопку «Поделиться» в Safari, затем «На экран «Домой»»."
            : "Tap the Share button in Safari, then \"Add to Home Screen\"."}
        </p>
      </div>
    );
  }

  if (!deferred) return null;

  const promptInstall = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
    } catch {
      /* noop */
    } finally {
      setDeferred(null);
    }
  };

  return (
    <button
      onClick={promptInstall}
      className="btn btn-primary w-full justify-center"
    >
      ⬇ {locale === "ru" ? "Установить приложение" : "Install app"}
    </button>
  );
}
