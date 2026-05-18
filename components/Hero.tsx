"use client";

import { motion } from "framer-motion";
import { useWorkout } from "./WorkoutContext";
import { useLocale } from "./LocaleProvider";
import { formatTime } from "@/lib/utils";

export function Hero() {
  const { streak, workoutSeconds, plan, currentDay, setStates } = useWorkout();
  const { t } = useLocale();
  const day = plan[currentDay];

  let total = 0;
  let done = 0;
  day?.exercises.forEach((ex, ei) => {
    const key = `wt2_d${currentDay}_e${ei}`;
    const state = setStates[key] ?? [];
    total += ex.sets;
    done += state.filter(Boolean).length;
  });
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section id="hero" className="relative mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="chip mb-5 inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
          <span>
            {t("hero.activeSession")} · {formatTime(workoutSeconds)}
          </span>
        </div>
        <h1 className="heading-display mx-auto max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          {t("hero.title.before")}
          <span className="bg-accent-gradient bg-clip-text text-transparent">
            {t("hero.title.accent")}
          </span>
          {t("hero.title.after")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          {t("hero.description")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-4 sm:gap-4"
      >
        <StatCard
          label={t("hero.stat.streak")}
          value={`${streak.streak}`}
          hint={t("hero.stat.streak.hint")}
          emoji="🔥"
        />
        <StatCard
          label={t("hero.stat.workouts")}
          value={`${streak.total}`}
          hint={t("hero.stat.workouts.hint")}
          emoji="💪"
        />
        <StatCard
          label={t("hero.stat.progress")}
          value={`${pct}%`}
          hint={day ? day.short : "—"}
          emoji="📊"
        />
        <StatCard
          label={t("hero.stat.time")}
          value={formatTime(workoutSeconds)}
          hint={t("hero.stat.time.hint")}
          emoji="⏱"
        />
      </motion.div>
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
  emoji,
}: {
  label: string;
  value: string;
  hint: string;
  emoji: string;
}) {
  return (
    <div className="card relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
        <span className="text-lg opacity-70">{emoji}</span>
      </div>
      <div className="heading-display mt-2 text-3xl font-bold sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs text-muted">{hint}</div>
    </div>
  );
}
