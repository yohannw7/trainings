"use client";

import { motion } from "framer-motion";
import { useWorkout } from "./WorkoutContext";
import { useTheme } from "./ThemeProvider";
import { useModal } from "./ModalProvider";
import { ThemeName } from "@/lib/types";

const SECTIONS = [
  { id: "training", label: "Тренировка", icon: "🏋️" },
  { id: "calculators", label: "Калькуляторы", icon: "🧮" },
  { id: "progress", label: "Прогресс", icon: "📈" },
];

export function Header() {
  const { streak } = useWorkout();
  const { open, close } = useModal();
  const { theme, setTheme, themes } = useTheme();

  const openSettings = () => {
    open(
      <SettingsModal
        theme={theme}
        themes={themes}
        setTheme={setTheme}
        onClose={close}
      />,
    );
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
            <span className="hidden text-xs text-muted sm:inline">нед.</span>
          </motion.div>
          <button
            onClick={openSettings}
            data-tour="settings"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-surface/40 text-muted transition-all hover:border-accent/50 hover:text-text"
            aria-label="Настройки"
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

function SettingsModal({
  theme,
  themes,
  setTheme,
  onClose,
}: {
  theme: ThemeName;
  themes: ThemeName[];
  setTheme: (t: ThemeName) => void;
  onClose: () => void;
}) {
  const themeMeta: Record<ThemeName, { label: string; gradient: string }> = {
    midnight: { label: "Midnight", gradient: "linear-gradient(135deg, #6366f1, #a855f7)" },
    dawn: { label: "Dawn", gradient: "linear-gradient(135deg, #ff7a59, #ffb86c)" },
    ocean: { label: "Ocean", gradient: "linear-gradient(135deg, #38bdf8, #10b981)" },
    forest: { label: "Forest", gradient: "linear-gradient(135deg, #4ade80, #facc15)" },
    violet: { label: "Violet", gradient: "linear-gradient(135deg, #a855f7, #ec4899)" },
  };

  return (
    <div>
      <h3 className="heading-display mb-1 text-2xl font-bold">Настройки</h3>
      <p className="mb-5 text-sm text-muted">ASH Train Tracker v2.0</p>

      <div className="mb-5">
        <span className="label">Тема оформления</span>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`group relative aspect-square rounded-2xl border-2 transition-all ${
                t === theme ? "border-accent shadow-glow" : "border-border/40 hover:border-accent/50"
              }`}
              style={{ background: themeMeta[t].gradient }}
              aria-label={themeMeta[t].label}
            >
              {t === theme && (
                <span className="absolute inset-0 grid place-items-center text-xl text-white drop-shadow">
                  ✓
                </span>
              )}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wider text-muted">
                {themeMeta[t].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button onClick={onClose} className="btn btn-primary">
          Готово
        </button>
      </div>
    </div>
  );
}
