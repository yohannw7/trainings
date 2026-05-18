"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/defaults";
import { readJSON, writeJSON } from "@/lib/storage";
import { useModal } from "./ModalProvider";
import { useLocale } from "./LocaleProvider";
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
  const { t } = useLocale();
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
  const bmiCategoryKey =
    bmi < 16
      ? "calc.bmi.cat.severe"
      : bmi < 18.5
        ? "calc.bmi.cat.under"
        : bmi < 25
          ? "calc.bmi.cat.normal"
          : bmi < 30
            ? "calc.bmi.cat.over"
            : bmi < 35
              ? "calc.bmi.cat.ob1"
              : bmi < 40
                ? "calc.bmi.cat.ob2"
                : "calc.bmi.cat.ob3";

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
            {t("calc.eyebrow")}
          </span>
          <h2 className="heading-display mt-2 text-3xl font-bold sm:text-4xl">{t("calc.title")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{t("calc.description")}</p>
        </div>
        <button onClick={editProfile} className="btn">
          {t("calc.editProfile")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <CalcCard title={t("calc.bmi.title")} desc={t("calc.bmi.desc")}>
          <div className="heading-display text-4xl font-bold">
            {bmi > 0 ? bmi.toFixed(1) : "—"}
          </div>
          <div className="mt-1 text-sm text-muted">
            {bmi > 0 ? t(bmiCategoryKey as Parameters<typeof t>[0]) : t("calc.bmi.noData")}
          </div>
        </CalcCard>

        <CalcCard title={t("calc.tdee.title")} desc={t("calc.tdee.desc")}>
          <div className="heading-display text-4xl font-bold">
            {tdee} {t("calc.tdee.kcal")}
          </div>
          <div className="mt-1 text-sm text-muted">
            {t("calc.tdee.bmr", { value: Math.round(bmr) })}
          </div>
        </CalcCard>

        <CalcCard
          title={t("calc.macro.title")}
          desc={t("calc.macro.goalLabel", {
            goal: t(`calc.macro.goal.${profile.goal}` as Parameters<typeof t>[0]),
          })}
        >
          <div className="grid grid-cols-3 gap-2">
            <Macro label={t("calc.macro.p")} value={macroP} grams={t("calc.macro.gramsShort")} accent />
            <Macro label={t("calc.macro.f")} value={macroF} grams={t("calc.macro.gramsShort")} />
            <Macro label={t("calc.macro.c")} value={macroC} grams={t("calc.macro.gramsShort")} accent />
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

function Macro({
  label,
  value,
  grams,
  accent,
}: {
  label: string;
  value: number;
  grams: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        accent ? "border-accent/30 bg-accent/5" : "border-border/60 bg-surface/30"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="heading-display mt-1 text-2xl font-bold">
        {value}
        <span className="ml-0.5 text-sm font-normal text-muted">{grams}</span>
      </div>
    </div>
  );
}

function RM1Card() {
  const [w, setW] = useState("80");
  const [reps, setReps] = useState("8");
  const { t } = useLocale();
  const weight = parseFloat(w) || 0;
  const r = parseInt(reps) || 1;
  const rm = weight > 0 && r > 0 ? Math.round(weight * (1 + r / 30)) : 0;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-3">
        <h3 className="heading-display text-xl font-bold">{t("calc.rm.title")}</h3>
        <p className="text-xs text-muted">{t("calc.rm.desc")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="label">{t("calc.rm.weight")}</span>
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
          <span className="label">{t("calc.rm.reps")}</span>
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
        <div className="heading-display text-3xl font-bold">
          {rm > 0 ? `${rm} ${t("common.kg")}` : "—"}
        </div>
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
  const { t } = useLocale();

  return (
    <div>
      <h3 className="heading-display mb-1 text-2xl font-bold">{t("calc.profile.title")}</h3>
      <p className="mb-4 text-sm text-muted">{t("calc.profile.desc")}</p>

      <div className="space-y-3">
        <div>
          <span className="label">{t("calc.profile.gender")}</span>
          <select
            className="input"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
          >
            <option value="male">{t("calc.profile.male")}</option>
            <option value="female">{t("calc.profile.female")}</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="label">{t("calc.profile.age")}</span>
            <input
              className="input"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <span className="label">{t("calc.profile.weight")}</span>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </div>
          <div>
            <span className="label">{t("calc.profile.height")}</span>
            <input
              className="input"
              type="number"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
            />
          </div>
        </div>
        <div>
          <span className="label">{t("calc.profile.activity")}</span>
          <select
            className="input"
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
          >
            <option value="1.2">{t("calc.profile.act.sedentary")}</option>
            <option value="1.375">{t("calc.profile.act.light")}</option>
            <option value="1.55">{t("calc.profile.act.moderate")}</option>
            <option value="1.725">{t("calc.profile.act.high")}</option>
            <option value="1.9">{t("calc.profile.act.extreme")}</option>
          </select>
        </div>
        <div>
          <span className="label">{t("calc.profile.goal")}</span>
          <select
            className="input"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value as CalcProfile["goal"] })}
          >
            <option value="cut">{t("calc.profile.goal.cut")}</option>
            <option value="maintain">{t("calc.profile.goal.maintain")}</option>
            <option value="bulk">{t("calc.profile.goal.bulk")}</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn">
          {t("common.cancel")}
        </button>
        <button onClick={() => onSave(form)} className="btn btn-primary">
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}
