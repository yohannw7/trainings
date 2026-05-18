"use client";

import { motion, useAnimationControls } from "framer-motion";
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
  const glint = useAnimationControls();

  const playGlint = () => {
    glint.set({ x: "-140%" });
    glint.start({
      x: "140%",
      transition: { duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] },
    });
  };

  return (
    <motion.div
      whileHover={{
        rotate: -2.5,
        y: -6,
        scale: 1.03,
        transition: { type: "spring", damping: 14, stiffness: 280 },
      }}
      whileTap={{ scale: 0.98, rotate: -1 }}
      onHoverStart={playGlint}
      onTapStart={playGlint}
      className="group card relative cursor-default overflow-hidden p-4 transition-shadow duration-300 hover:shadow-glow sm:p-5"
    >
      {/* ── Glass surface highlights (always on, very subtle) ── */}
      {/* Top edge specular */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
        }}
      />
      {/* Inner glass border */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      />

      {/* ── Sweeping glass glint, plays once on hover ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <motion.div
          aria-hidden
          initial={{ x: "-140%" }}
          animate={glint}
          className="absolute -top-1/2 left-0 h-[200%] w-[55%]"
          style={{ transform: "skewX(28deg)", filter: "blur(8px)" }}
        >
          {/* Soft wide halo */}
          <span
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Bright core (a thinner, sharper white streak) */}
          <span
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{
              width: "22%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
              filter: "blur(2px)",
              mixBlendMode: "screen",
            }}
          />
          {/* Chromatic dispersion — subtle prism */}
          <span
            className="absolute inset-y-0 left-[40%]"
            style={{
              width: "8%",
              background:
                "linear-gradient(90deg, transparent, rgba(120,170,255,0.45), transparent)",
              mixBlendMode: "screen",
              filter: "blur(3px)",
            }}
          />
          <span
            className="absolute inset-y-0 left-[52%]"
            style={{
              width: "8%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,170,210,0.40), transparent)",
              mixBlendMode: "screen",
              filter: "blur(3px)",
            }}
          />
        </motion.div>
      </div>

      <div className="relative flex items-start justify-between">
        <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
        <span className="text-lg opacity-70 transition-transform duration-300 group-hover:scale-110">
          {emoji}
        </span>
      </div>
      <div className="heading-display relative mt-2 text-3xl font-bold sm:text-4xl">{value}</div>
      <div className="relative mt-1 text-xs text-muted">{hint}</div>
    </motion.div>
  );
}
