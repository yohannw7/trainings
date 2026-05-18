"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useWorkout } from "./WorkoutContext";
import { formatDuration } from "@/lib/utils";
import { Heatmap } from "./Heatmap";

export function ProgressSection() {
  const { history, prs } = useWorkout();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const prList = Object.entries(prs).sort((a, b) => b[1].weight - a[1].weight);

  return (
    <section id="progress" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent2">
          04 — История
        </span>
        <h2 className="heading-display mt-2 text-3xl font-bold sm:text-4xl">Прогресс</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Активность, личные рекорды и все завершённые тренировки.
        </p>
      </div>

      {/* Heatmap */}
      <div className="mb-4">
        <Heatmap history={history} />
      </div>

      {/* Personal records */}
      {prList.length > 0 && (
        <div className="card mb-4 p-5 sm:p-6">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="heading-display text-xl font-bold">🏆 Личные рекорды</h3>
            <span className="text-xs text-muted">{prList.length} упражнений</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {prList.slice(0, 8).map(([name, pr]) => (
              <div
                key={name}
                className="flex items-baseline justify-between gap-3 rounded-xl border border-border/40 bg-surface/30 px-3 py-2"
              >
                <span className="truncate text-sm">{name}</span>
                <div className="text-right">
                  <span className="heading-display text-base font-bold text-amber-300">
                    {pr.weight} кг
                  </span>
                  <p className="text-[10px] text-muted">
                    {pr.date.replace(/-/g, ".")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="text-5xl opacity-40">📈</div>
          <h3 className="heading-display text-xl font-bold">Пока пусто</h3>
          <p className="max-w-xs text-sm text-muted">
            Заверши первую тренировку — и она появится здесь.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry, i) => {
            const totalSets = entry.exercises.reduce((a, e) => a + e.sets, 0);
            const doneSets = entry.exercises.reduce((a, e) => a + e.done, 0);
            const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
            const isOpen = openIdx === i;

            return (
              <motion.div
                key={i}
                layout
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="card cursor-pointer overflow-hidden p-4 transition-colors hover:border-accent/30 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono text-muted">
                    {entry.date.replace(/-/g, ".")}
                  </span>
                  <h4 className="heading-display flex-1 text-lg font-bold">{entry.dayName}</h4>
                  <span className="text-xs text-muted">
                    {doneSets}/{totalSets} · {pct}%
                    {entry.duration ? ` · ⏱ ${formatDuration(entry.duration)}` : ""}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    className="text-muted"
                  >
                    ›
                  </motion.span>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-1.5 border-t border-border/40 pt-4">
                        {entry.exercises.map((ex, ei) => {
                          const exPct = ex.sets > 0 ? Math.round((ex.done / ex.sets) * 100) : 0;
                          return (
                            <div
                              key={ei}
                              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm"
                            >
                              <span className="flex-1">{ex.name}</span>
                              <span className="font-mono text-xs text-accent2 tracking-widest">
                                {"●".repeat(ex.done)}
                                <span className="text-muted">{"○".repeat(ex.sets - ex.done)}</span>
                              </span>
                              <span className="w-10 text-right text-xs text-muted">
                                {exPct}%
                              </span>
                              {ex.weight && (
                                <span className="w-14 text-right text-xs text-muted">
                                  {ex.weight} кг
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
