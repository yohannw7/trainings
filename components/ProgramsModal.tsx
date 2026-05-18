"use client";

import { useState } from "react";
import { BUILTIN_PROGRAMS } from "@/lib/defaults";
import type { Plan } from "@/lib/types";

type Props = {
  onPick: (plan: Plan) => void;
  onClose: () => void;
};

export function ProgramsModal({ onPick, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (confirming && selected) {
    return (
      <div>
        <h3 className="heading-display mb-2 text-2xl font-bold">
          Заменить текущий план?
        </h3>
        <p className="mb-4 text-sm text-muted">
          Текущий план будет заменён на «{selected}». Прогресс этого дня сбросится.
          Если жалко — сначала сохрани текущий как пресет.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setConfirming(false)} className="btn">
            ← Назад
          </button>
          <button
            onClick={() => onPick(BUILTIN_PROGRAMS[selected])}
            className="btn btn-primary"
          >
            Загрузить
          </button>
        </div>
      </div>
    );
  }

  const programs = Object.entries(BUILTIN_PROGRAMS);
  const current = selected ? BUILTIN_PROGRAMS[selected] : null;

  return (
    <div>
      <h3 className="heading-display mb-1 text-2xl font-bold">Готовые программы</h3>
      <p className="mb-4 text-sm text-muted">
        Проверенные шаблоны на разные цели. Выбери и нажми «Загрузить».
      </p>

      <div className="space-y-2">
        {programs.map(([name, plan]) => {
          const isActive = name === selected;
          return (
            <button
              key={name}
              onClick={() => setSelected(isActive ? null : name)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? "border-accent/50 bg-accent/10"
                  : "border-border/60 bg-surface/30 hover:border-accent/40"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="heading-display text-base font-bold">{name}</h4>
                <span className="text-xs text-muted">{plan.length} дн.</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plan.map((d, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-border/40 bg-surface/40 px-2 py-0.5 text-[10px] text-muted"
                  >
                    {d.short}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {current && (
        <div className="mt-4 rounded-2xl border border-border/60 bg-surface/30 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">Превью</p>
          <div className="space-y-3">
            {current.map((d, i) => (
              <div key={i}>
                <p className="text-sm font-semibold">{d.name}</p>
                <ul className="mt-1 space-y-0.5">
                  {d.exercises.map((ex, ei) => (
                    <li key={ei} className="text-xs text-muted">
                      • {ex.name} — {ex.sets}×{ex.target}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between gap-2">
        <button onClick={onClose} className="btn">
          Закрыть
        </button>
        <button
          onClick={() => selected && setConfirming(true)}
          disabled={!selected}
          className="btn btn-primary"
        >
          Загрузить выбранную
        </button>
      </div>
    </div>
  );
}
