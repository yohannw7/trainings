"use client";

import { useState } from "react";
import type { Day, Exercise } from "@/lib/types";
import { useToast } from "./ToastProvider";
import { useLocale } from "./LocaleProvider";

type Props = {
  initial: Day;
  onSave: (day: Day) => void;
  onClose: () => void;
};

export function DayEditorModal({ initial, onSave, onClose }: Props) {
  const { toast } = useToast();
  const { t } = useLocale();
  const [name, setName] = useState(initial.name);
  const [short, setShort] = useState(initial.short);
  const [exercises, setExercises] = useState<Exercise[]>(initial.exercises);

  const updateEx = (i: number, patch: Partial<Exercise>) => {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)));
  };

  const removeEx = (i: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addEx = () => {
    setExercises((prev) => [...prev, { name: "", sets: 3, target: "10" }]);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedShort = short.trim();
    if (!trimmedName || !trimmedShort) {
      toast(t("editor.fillNames"));
      return;
    }
    const cleaned = exercises
      .map((ex) => ({
        name: ex.name.trim(),
        sets: Math.max(1, Math.min(20, Math.floor(ex.sets) || 3)),
        target: ex.target.trim() || t("editor.target.default"),
      }))
      .filter((ex) => ex.name.length > 0);
    if (cleaned.length === 0) {
      toast(t("editor.minOne"));
      return;
    }
    onSave({ name: trimmedName, short: trimmedShort, exercises: cleaned });
  };

  return (
    <div>
      <h3 className="heading-display mb-4 text-2xl font-bold">{t("editor.title")}</h3>
      <div className="mb-3">
        <span className="label">{t("training.addDay.name")}</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="mb-4">
        <span className="label">{t("training.addDay.short")}</span>
        <input className="input" value={short} onChange={(e) => setShort(e.target.value)} />
      </div>

      <div className="mb-4">
        <span className="label">{t("editor.exercises")}</span>
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                className="input flex-1 min-w-[140px]"
                placeholder={t("editor.exName")}
                value={ex.name}
                onChange={(e) => updateEx(i, { name: e.target.value })}
              />
              <input
                className="input w-20"
                type="number"
                placeholder={t("editor.exSets")}
                min={1}
                max={20}
                value={ex.sets}
                onChange={(e) => updateEx(i, { sets: parseInt(e.target.value) || 3 })}
              />
              <input
                className="input w-24"
                placeholder={t("editor.exTarget")}
                value={ex.target}
                onChange={(e) => updateEx(i, { target: e.target.value })}
              />
              <button
                onClick={() => removeEx(i)}
                className="btn btn-danger px-3 py-2"
                aria-label={t("common.delete")}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button onClick={addEx} className="btn btn-success mt-3 w-full sm:w-auto">
          {t("editor.addEx")}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button onClick={onClose} className="btn">
          {t("common.cancel")}
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}
