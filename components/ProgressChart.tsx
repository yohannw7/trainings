"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useWorkout } from "./WorkoutContext";
import { useLocale } from "./LocaleProvider";

export function ProgressChart() {
  const { history } = useWorkout();
  const { t, locale } = useLocale();

  // Collect all exercise names that have weight data
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    history.forEach((entry) => {
      entry.exercises.forEach((ex) => {
        if (ex.weight && parseFloat(ex.weight) > 0) names.add(ex.name);
      });
    });
    return Array.from(names);
  }, [history]);

  const [selected, setSelected] = useState<string>("");

  // Build chart data for selected exercise
  const chartData = useMemo(() => {
    if (!selected) return [];
    const points: Array<{ date: string; weight: number; rpe?: number }> = [];
    // History is newest-first, reverse for chart
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      const ex = entry.exercises.find((e) => e.name === selected && e.weight);
      if (ex) {
        points.push({
          date: formatChartDate(entry.date, locale),
          weight: parseFloat(ex.weight),
          rpe: typeof ex.avgRpe === "number" ? ex.avgRpe : undefined,
        });
      }
    }
    return points;
  }, [selected, history, locale]);

  if (exerciseNames.length === 0) return null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="heading-display text-xl font-bold">
          {locale === "ru" ? "📈 Прогресс по весу" : "📈 Weight progress"}
        </h3>
      </div>

      <select
        className="input mb-4 max-w-xs"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">
          {locale === "ru" ? "— Выбери упражнение —" : "— Pick an exercise —"}
        </option>
        {exerciseNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {selected && chartData.length > 1 ? (
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" strokeOpacity={0.4} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "rgb(var(--muted))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgb(var(--muted))" }}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2.5", "dataMax + 2.5"]}
                unit={locale === "ru" ? " кг" : " kg"}
              />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--surface))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "rgb(var(--muted))" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="rgb(var(--accent))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "rgb(var(--accent))", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "rgb(var(--accent))", strokeWidth: 2, stroke: "#fff" }}
                name={locale === "ru" ? "Вес" : "Weight"}
              />
              {chartData.some((d) => d.rpe !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="rpe"
                  stroke="rgb(var(--accent2))"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="RPE"
                  yAxisId={0}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : selected && chartData.length <= 1 ? (
        <p className="text-center text-sm text-muted">
          {locale === "ru"
            ? "Нужно минимум 2 тренировки с этим упражнением для графика"
            : "Need at least 2 sessions with this exercise to show a chart"}
        </p>
      ) : null}
    </div>
  );
}

function formatChartDate(isoWeek: string, locale: string): string {
  // "YYYY-Www" -> short label
  const m = isoWeek.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return isoWeek;
  return locale === "ru" ? `Нед ${m[2]}` : `Wk ${m[2]}`;
}
