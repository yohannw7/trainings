"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/defaults";
import { readJSON, writeJSON } from "@/lib/storage";
import { useModal } from "./ModalProvider";
import type { CalcProfile } from "@/lib/types";

const DEFAULT_PROFILE: CalcProfile = {
  gender: "male",
  age: "25",
  weight: "75",
  height: "175",
  activity: "1.55",
  goal: "maintain",
};

export function CalculatorsSection() {
  const { open, close } = useModal();
  const [profile, setProfile] = useState<CalcProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(readJSON<CalcProfile>(STORAGE_KEYS.CALC_PROFILE, DEFAULT_PROFILE));
    setHydrated(true);
  }, []);

  const saveProfile = (p: CalcProfile) => {
    setProfile(p);
    writeJSON(STORAGE_KEYS.CALC_PROFILE, p);
  };

  const editProfile = () => {
    open(
      <ProfileModal
        initial={profile}
        onSave={(p) => {
          saveProfile(p);
          close();
        }}
        onClose={close}
      />,
    );
  };

  if (!hydrated) return null;

  // BMI
  const w = parseFloat(profile.weight) || 0;
  const h = parseFloat(profile.height) || 0;
  const bmi = w && h ? w / Math.pow(h / 100, 2) : 0;
  const bmiCategory =
    bmi < 16
      ? "Выраженный дефицит"
      : bmi < 18.5
        ? "Недостаточный"
        : bmi < 25
          ? "Норма"
          : bmi < 30
            ? "Избыточный"
            : bmi < 35
              ? "Ожирение I"
              : bmi < 40
                ? "Ожирение II"
                : "Ожирение III";

  // TDEE
  const a = parseFloat(profile.age) || 25;
  const act = parseFloat(profile.activity) || 1.55;
  const bmr =
    profile.gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  const tdee = Math.round(bmr * act);

  // Macros
  const goalRatios = {
    cut: { p: 0.4, f: 0.25, c: 0.35 },
    maintain: { p: 0.3, f: 0.25, c: 0.45 },
    bulk: { p: 0.25, f: 0.2, c: 0.55 },
  } as const;
  const r = goalRatios[profile.goal];
  const macroP = Math.round((tdee * r.p) / 4);
  const macroF = Math.round((tdee * r.f) / 9);
  const macroC = Math.round((tdee * r.c) / 4);

  return (
    <section id="calculators" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent2">
            03 — Калькуляторы
          </span>
          <h2 className="heading-display mt-2 text-3xl font-bold sm:text-4xl">Метрики тела</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Введи данные один раз — расчёты обновятся автоматически.
          </p>
        </div>
        <button onClick={editProfile} className="btn">
          ✎ Изменить данные
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <CalcCard title="ИМТ" desc="Индекс массы тела">
          <div className="heading-display text-4xl font-bold">
            {bmi > 0 ? bmi.toFixed(1) : "—"}
          </div>
          <div className="mt-1 text-sm text-muted">{bmi > 0 ? bmiCategory : "Нет данных"}</div>
        </CalcCard>

        <CalcCard title="TDEE" desc="Суточная норма калорий">
          <div className="heading-display text-4xl font-bold">{tdee} ккал</div>
          <div className="mt-1 text-sm text-muted">BMR: {Math.round(bmr)} ккал</div>
        </CalcCard>

        <CalcCard title="БЖУ" desc={`Цель: ${{ cut: "сушка", maintain: "поддержание", bulk: "масса" }[profile.goal]}`}>
          <div className="grid grid-cols-3 gap-2">
            <Macro label="Б" value={macroP} accent />
            <Macro label="Ж" value={macroF} />
            <Macro label="У" value={macroC} accent />
          </div>
        </CalcCard>

        <RM1Card />
      </div>
    </section>
  );
}

function CalcCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-3">
        <h3 className="heading-display text-xl font-bold">{title}</h3>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Macro({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${accent ? "border-accent/30 bg-accent/5" : "border-border/60 bg-surface/30"}`}>
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="heading-display mt-1 text-2xl font-bold">{value}<span className="ml-0.5 text-sm font-normal text-muted">г</span></div>
    </div>
  );
}

function RM1Card() {
  const [w, setW] = useState("80");
  const [reps, setReps] = useState("8");
  const weight = parseFloat(w) || 0;
  const r = parseInt(reps) || 1;
  const rm = weight > 0 && r > 0 ? Math.round(weight * (1 + r / 30)) : 0;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-3">
        <h3 className="heading-display text-xl font-bold">1 RM</h3>
        <p className="text-xs text-muted">Максимум на 1 раз (формула Эпли)</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="label">Вес (кг)</span>
          <input
            className="input"
            type="number"
            value={w}
            onChange={(e) => setW(e.target.value)}
            min={1}
            max={500}
          />
        </div>
        <div>
          <span className="label">Повторы</span>
          <input
            className="input"
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            min={1}
            max={30}
          />
        </div>
      </div>
      <div className="mt-4">
        <div className="heading-display text-3xl font-bold">{rm > 0 ? `${rm} кг` : "—"}</div>
      </div>
    </div>
  );
}

function ProfileModal({
  initial,
  onSave,
  onClose,
}: {
  initial: CalcProfile;
  onSave: (p: CalcProfile) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CalcProfile>(initial);

  return (
    <div>
      <h3 className="heading-display mb-1 text-2xl font-bold">Ваши данные</h3>
      <p className="mb-4 text-sm text-muted">Подставится во все калькуляторы</p>

      <div className="space-y-3">
        <div>
          <span className="label">Пол</span>
          <select
            className="input"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
          >
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="label">Возраст</span>
            <input
              className="input"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <span className="label">Вес (кг)</span>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </div>
          <div>
            <span className="label">Рост (см)</span>
            <input
              className="input"
              type="number"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
            />
          </div>
        </div>
        <div>
          <span className="label">Активность</span>
          <select
            className="input"
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
          >
            <option value="1.2">Сидячий образ жизни</option>
            <option value="1.375">Лёгкая (1-3 дня)</option>
            <option value="1.55">Умеренная (3-5 дней)</option>
            <option value="1.725">Высокая (6-7 дней)</option>
            <option value="1.9">Экстремальная</option>
          </select>
        </div>
        <div>
          <span className="label">Цель</span>
          <select
            className="input"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value as CalcProfile["goal"] })}
          >
            <option value="cut">Сушка</option>
            <option value="maintain">Поддержание</option>
            <option value="bulk">Набор массы</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn">
          Отмена
        </button>
        <button onClick={() => onSave(form)} className="btn btn-primary">
          Сохранить
        </button>
      </div>
    </div>
  );
}
