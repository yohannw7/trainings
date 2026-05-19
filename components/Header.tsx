"use client";

import { motion } from "framer-motion";
import { useWorkout } from "./WorkoutContext";
import { useTheme } from "./ThemeProvider";
import { useModal } from "./ModalProvider";
import { useLocale } from "./LocaleProvider";
import { InstallButton } from "./InstallButton";
import { ThemeName } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
export function Header() {
  const { streak } = useWorkout();
  const { open, close } = useModal();
  const { t } = useLocale();

  const SECTIONS = [
    { id: "training", label: t("nav.training"), icon: "🏋️" },
    { id: "calculators", label: t("nav.calculators"), icon: "🧮" },
    { id: "progress", label: t("nav.progress"), icon: "📈" },
  ];

  const openSettings = () => {
    open(<SettingsModal onClose={close} />);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <div className="card flex items-center justify-between gap-3 rounded-2xl border-border/50 px-4 py-3 sm:px-5 sm:py-3.5">
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-accent-gradient shadow-glow">
            <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-white">
              A
            </span>
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="heading-display text-base font-bold tracking-tight">ASH TRAIN</span>
            <span className="text-[10px] uppercase tracking-widest text-muted">v2.0</span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface/60 hover:text-text"
            >
              <span className="mr-1.5">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/40 px-3 py-1.5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-base">🔥</span>
            <span className="heading-display text-sm font-bold">{streak.streak}</span>
            <span className="hidden text-xs text-muted sm:inline">{t("common.weeks")}</span>
          </motion.div>
          <button
            onClick={openSettings}
            data-tour="settings"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-surface/40 text-muted transition-all hover:border-accent/50 hover:text-text"
            aria-label={t("header.settings")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  const { theme, setTheme, themes, customAccent, setCustomAccent } = useTheme();
  const { locale, setLocale, locales } = useLocale();
  const themeMeta: Record<ThemeName, { label: string; gradient: string }> = {
    midnight: { label: "Midnight", gradient: "linear-gradient(135deg, #6366f1, #a855f7)" },
    dawn: { label: "Dawn", gradient: "linear-gradient(135deg, #ff7a59, #ffb86c)" },
    ocean: { label: "Ocean", gradient: "linear-gradient(135deg, #38bdf8, #10b981)" },
    forest: { label: "Forest", gradient: "linear-gradient(135deg, #4ade80, #facc15)" },
    violet: { label: "Violet", gradient: "linear-gradient(135deg, #a855f7, #ec4899)" },
    custom: { label: "Custom", gradient: "" }, // will be set inline below
  };

  const langMeta: Record<Locale, { label: string; flag: string }> = {
    ru: { label: t("settings.langRu"), flag: "🇷🇺" },
    en: { label: t("settings.langEn"), flag: "🇬🇧" },
  };

  return (
    <div>
      <h3 className="heading-display mb-1 text-2xl font-bold">{t("settings.title")}</h3>
      <p className="mb-5 text-sm text-muted">{t("settings.subtitle")}</p>

      {/* Language */}
      <div className="mb-5">
        <span className="label">{t("settings.language")}</span>
        <div className="grid grid-cols-2 gap-2">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                l === locale
                  ? "border-accent bg-accent/10 text-text"
                  : "border-border/40 bg-surface/30 text-muted hover:border-accent/50"
              }`}
            >
              <span className="text-base">{langMeta[l].flag}</span>
              <span>{langMeta[l].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="mb-5">
        <span className="label">{t("settings.theme")}</span>
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-6">
          {themes.map((th) => {
            const isCustom = th === "custom";
            const gradient = isCustom
              ? `linear-gradient(135deg, ${customAccent}, ${customAccent}cc)`
              : themeMeta[th].gradient;
            return (
              <div key={th} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setTheme(th)}
                  className={`group relative aspect-square w-full overflow-hidden rounded-2xl border-2 transition-all ${
                    th === theme ? "border-accent shadow-glow" : "border-border/40 hover:border-accent/50"
                  }`}
                  style={{ background: gradient }}
                  aria-label={themeMeta[th].label}
                >
                  {isCustom && (
                    <span className="pointer-events-none absolute inset-0 grid place-items-center text-xl text-white drop-shadow">
                      🎨
                    </span>
                  )}
                  {th === theme && !isCustom && (
                    <span className="absolute inset-0 grid place-items-center text-xl text-white drop-shadow">
                      ✓
                    </span>
                  )}
                </button>
                <span className="whitespace-nowrap text-[10px] uppercase tracking-wider text-muted">
                  {themeMeta[th].label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Custom accent color picker */}
        {theme === "custom" && (
          <div className="mt-4 rounded-2xl border border-border/60 bg-surface/30 p-4">
            <span className="label">{t("settings.customAccent")}</span>
            <div className="mt-2 flex items-center gap-3">
              <label className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-border/60">
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span
                  className="block h-full w-full"
                  style={{ background: customAccent }}
                />
              </label>
              <input
                type="text"
                value={customAccent}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
                    const hex = v.startsWith("#") ? v : `#${v}`;
                    if (hex.length === 7) setCustomAccent(hex);
                  }
                }}
                className="input flex-1 font-mono uppercase"
                placeholder="#6366f1"
                maxLength={7}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["#6366f1", "#ec4899", "#f43f5e", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#0ea5e9"].map(
                (preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomAccent(preset)}
                    className="h-7 w-7 rounded-full border-2 border-border/40 transition-transform hover:scale-110"
                    style={{ background: preset }}
                    aria-label={preset}
                  />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* RPE switch */}
      <RpeToggle />

      {/* Install (PWA) */}
      <div className="mb-1 mt-6">
        <InstallButton />
      </div>

      {/* Replay onboarding */}
      <button
        onClick={() => {
          localStorage.removeItem("onboarding_done_v2");
          onClose();
          // Small delay so the modal close animation finishes before tour appears
          setTimeout(() => window.location.reload(), 200);
        }}
        className="btn mt-3 w-full justify-center"
      >
        🎯 {t("settings.tour")}
      </button>

      <div className="mt-8 flex justify-end">
        <button onClick={onClose} className="btn btn-primary">
          {t("settings.ok")}
        </button>
      </div>
    </div>
  );
}

function RpeToggle() {
  const { rpeEnabled, setRpeEnabled } = useWorkout();
  const { t } = useLocale();
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/30 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-text">{t("settings.rpeLabel")}</p>
        <p className="mt-0.5 text-xs text-muted">{t("settings.rpeDesc")}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={rpeEnabled}
        onClick={() => setRpeEnabled(!rpeEnabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          rpeEnabled ? "bg-accent-gradient" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            rpeEnabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
