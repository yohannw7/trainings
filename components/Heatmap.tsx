"use client";

import { useMemo, useState } from "react";
import type { WorkoutHistoryEntry } from "@/lib/types";
import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n";

type Props = {
  history: WorkoutHistoryEntry[];
};

const WEEKS = 26; // ~6 months

function getDayDate(d: Date) {
  // YYYY-MM-DD in local time
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoWeekToDate(isoWeek: string): Date | null {
  // "YYYY-Www" -> Monday of that week
  const m = isoWeek.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const week = parseInt(m[2], 10);
  // ISO week: Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7; // Mon=0
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - jan4Day);
  const result = new Date(week1Monday);
  result.setDate(week1Monday.getDate() + (week - 1) * 7);
  return result;
}

export function Heatmap({ history }: Props) {
  const { t, locale } = useLocale();
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Map day -> count (each history entry covers a whole week visually)
  const dayCounts = useMemo(() => {
    const map: Record<string, number> = {};
    history.forEach((entry) => {
      const date = isoWeekToDate(entry.date);
      if (!date) return;
      // Place a mark on the Monday of that ISO week (since we don't store actual day)
      const key = getDayDate(date);
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [history]);

  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - WEEKS * 7);
    // Align start to Monday
    const dayOfWeek = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayOfWeek);

    const grid: Array<{ date: string; count: number; future: boolean }> = [];
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        const cur = new Date(start);
        cur.setDate(start.getDate() + w * 7 + d);
        const key = getDayDate(cur);
        grid.push({
          date: key,
          count: dayCounts[key] || 0,
          future: cur > today,
        });
      }
    }
    return grid;
  }, [dayCounts]);

  const totalWorkouts = history.length;
  const last30Days = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    let count = 0;
    Object.entries(dayCounts).forEach(([key, c]) => {
      const d = new Date(key);
      if (d >= cutoff) count += c;
    });
    return count;
  }, [dayCounts]);

  return (
    <div className="card relative p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="heading-display text-xl font-bold">{t("heatmap.title")}</h3>
          <p className="text-xs text-muted">{t("heatmap.subtitle")}</p>
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span>
            <span className="heading-display mr-1 text-base font-bold text-text">
              {totalWorkouts}
            </span>
            {t("heatmap.total")}
          </span>
          <span>
            <span className="heading-display mr-1 text-base font-bold text-text">
              {last30Days}
            </span>
            {t("heatmap.last30")}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1">
          <div
            className="grid auto-cols-[14px] grid-flow-col grid-rows-7 gap-[3px]"
            onMouseLeave={() => setTooltip(null)}
          >
            {cells.map((cell, i) => (
              <div
                key={i}
                onMouseEnter={(e) => {
                  if (cell.future) return;
                  const r = (e.target as HTMLElement).getBoundingClientRect();
                  setTooltip({
                    date: cell.date,
                    count: cell.count,
                    x: r.left + r.width / 2,
                    y: r.top,
                  });
                }}
                className={`h-[14px] w-[14px] rounded-[3px] transition-colors ${cellColor(cell.count, cell.future)}`}
                title={`${cell.date}: ${cell.count}`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted">
            <span>{t("heatmap.legend.less")}</span>
            <div className="flex gap-[3px]">
              <div className={`h-[10px] w-[10px] rounded-[2px] ${cellColor(0, false)}`} />
              <div className={`h-[10px] w-[10px] rounded-[2px] ${cellColor(1, false)}`} />
              <div className={`h-[10px] w-[10px] rounded-[2px] ${cellColor(2, false)}`} />
            </div>
            <span>{t("heatmap.legend.more")}</span>
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[150] -translate-x-1/2 -translate-y-full rounded-lg border border-border/60 bg-bg px-2.5 py-1.5 text-xs text-text shadow-soft"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          {formatHeatmapDate(tooltip.date, locale)} · {tooltip.count}
        </div>
      )}
    </div>
  );
}

function formatHeatmapDate(date: string, locale: Locale): string {
  // input "YYYY-MM-DD"
  if (locale === "ru") return date.replace(/-/g, ".");
  // English: "Mar 14"
  const [y, m, d] = date.split("-");
  const monthIdx = parseInt(m, 10) - 1;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[monthIdx] ?? m} ${parseInt(d, 10)}, ${y}`;
}

function cellColor(count: number, future: boolean): string {
  if (future) return "bg-surface/20";
  if (count === 0) return "bg-surface/50 hover:bg-surface";
  if (count === 1) return "bg-accent/40";
  if (count === 2) return "bg-accent/70";
  return "bg-accent";
}
