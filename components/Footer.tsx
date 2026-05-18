"use client";

import { useLocale } from "./LocaleProvider";

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-border/40 bg-bg/60 py-8 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted sm:px-6">
        <div className="heading-display text-base font-bold">ASH TRAIN</div>
        <p>
          {t("footer.tagline")} · v2.0 · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
