"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useWorkout } from "./WorkoutContext";
import { useLocale } from "./LocaleProvider";
import { useToast } from "./ToastProvider";
import { formatDurationLocalized } from "@/lib/i18n";
import { formatHistoryEntry, shareOrCopy } from "@/lib/share";
import { Heatmap } from "./Heatmap";
import { ProgressChart } from "./ProgressChart";

export function ProgressSection() {
  const { history, prs } = useWorkout();
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const prList = Object.entries(prs).sort((a, b) => b[1].weight - a[1].weight);

  const formatHistDate = (date: string) => {
    if (locale === "ru") return date.replace(/-/g, ".");
    return date.replace("W", "Wk ");
  };

  return (
    <section id="progress" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent2">
          {t("progress.eyebrow")}
        </span>
        <h2 className="heading-display mt-2 text-3xl font-bold sm:text-4xl">
          {t("progress.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("progress.description")}</p>
      </div>

      {/* Heatmap */}
      <div className="mb-4">
        <Heatmap history={history} />
      </div>

      {/* Weight progress chart */}
      <div className="mb-4">
        <ProgressChart />
      </div>

      {/* Personal records */}
      {prList.length > 0 && (
        <div className="card mb-4 p-5 sm:p-6">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="heading-display text-xl font-bold">{t("progress.prs.title")}</h3>
            <span className="text-xs text-muted">
              {t("progress.prs.count", { n: prList.length })}
            </span>
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
                    {pr.weight} {t("common.kg")}
                  </span>
                  <p className="text-[10px] text-muted">{formatHistDate(pr.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="text-5xl opacity-40">📈</div>
          <h3 className="heading-display text-xl font-bold">{t("progress.empty.title")}</h3>
          <p className="max-w-xs text-sm text-muted">{t("progress.empty.desc")}</p>
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
                  <span className="text-xs font-mono text-muted">{formatHistDate(entry.date)}</span>
                  <h4 className="heading-display flex-1 text-lg font-bold">{entry.dayName}</h4>
                  <span className="text-xs text-muted">
                    {doneSets}/{totalSets} · {pct}%
                    {entry.duration ? ` · ⏱ ${formatDurationLocalized(entry.duration, locale)}` : ""}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const text = formatHistoryEntry(entry, locale);
                      const result = await shareOrCopy(text, entry.dayName);
                      if (result === "copied") toast(t("toast.copied"));
                      else if (result === "failed") toast(t("toast.shareFailed"));
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full border border-border/60 text-muted transition-colors hover:border-accent/50 hover:text-text"
                    aria-label={t("training.share")}
                    title={t("training.share")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                  <motion.span animate={{ rotate: isOpen ? 90 : 0 }} className="text-muted">
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
                              <span className="w-10 text-right text-xs text-muted">{exPct}%</span>
                              {ex.weight && (
                                <span className="w-14 text-right text-xs text-muted">
                                  {ex.weight} {t("common.kg")}
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
