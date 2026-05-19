"use client";

import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import { useState } from "react";
import { setKey, weightKey } from "@/lib/defaults";
import { useWorkout } from "./WorkoutContext";
import { useModal } from "./ModalProvider";
import { useToast } from "./ToastProvider";
import { useLocale } from "./LocaleProvider";
import { ExerciseDrawer } from "./ExerciseDrawer";
import { DayEditorModal } from "./DayEditorModal";
import { ProgramsModal } from "./ProgramsModal";
import { formatPlan, shareOrCopy } from "@/lib/share";
import type { Exercise } from "@/lib/types";

export function TrainingSection() {
  const {
    plan,
    currentDay,
    setCurrentDay,
    setStates,
    weights,
    addDay,
    deleteDay,
    saveDayEdit,
    reorderExercises,
    resetDay,
    completeDay,
    setWeight,
    savePreset,
    loadPreset,
    deletePreset,
    presets,
    loadProgram,
    isPR,
    getLastWeight,
    getWeightSuggestion,
  } = useWorkout();
  const { open, close } = useModal();
  const { toast } = useToast();
  const { t, locale } = useLocale();

  const [drawerEx, setDrawerEx] = useState<{ di: number; ei: number } | null>(null);

  const day = plan[currentDay];

  let total = 0;
  let done = 0;
  day?.exercises.forEach((ex, ei) => {
    const state = setStates[setKey(currentDay, ei)] ?? [];
    total += ex.sets;
    done += state.filter(Boolean).length;
  });
  const dayPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const askAddDay = () => {
    open(
      <AddDayModal
        onConfirm={(name, short) => {
          addDay(name, short);
          close();
        }}
        onCancel={close}
      />,
    );
  };

  const askDeleteDay = (di: number) => {
    open(
      <ConfirmModal
        title={t("training.deleteDay.title", { name: plan[di].name })}
        description={t("training.deleteDay.desc")}
        confirmLabel={t("common.delete")}
        confirmVariant="danger"
        onConfirm={() => {
          deleteDay(di);
          close();
        }}
        onCancel={close}
      />,
    );
  };

  const editDay = (di: number) => {
    open(
      <DayEditorModal
        initial={plan[di]}
        onSave={(d) => {
          saveDayEdit(di, d);
          close();
        }}
        onClose={close}
      />,
    );
  };

  const askResetDay = () => {
    open(
      <ConfirmModal
        title={t("training.reset.title")}
        description={t("training.reset.desc")}
        confirmLabel={t("training.reset.confirm")}
        confirmVariant="danger"
        onConfirm={() => {
          resetDay();
          close();
          toast(t("training.reset.toast"));
        }}
        onCancel={close}
      />,
    );
  };

  const askSavePreset = () => {
    open(
      <PresetSaveModal
        onConfirm={(name) => {
          savePreset(name);
          close();
        }}
        onCancel={close}
      />,
    );
  };

  const askLoadPreset = (name: string) => {
    if (!name) return;
    open(
      <ConfirmModal
        title={t("training.preset.load.title", { name })}
        description={t("training.preset.load.desc")}
        confirmLabel={t("programs.replace.confirm")}
        onConfirm={() => {
          loadPreset(name);
          close();
        }}
        onCancel={close}
      />,
    );
  };

  return (
    <section id="training" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <SectionHeader
        eyebrow={t("training.eyebrow")}
        title={t("training.title")}
        description={t("training.description")}
      />

      {/* Day pills */}
      <div data-tour="day-pills" className="card mb-5 flex flex-wrap items-center gap-2 p-3">
        {plan.map((d, i) => (
          <button
            key={i}
            onClick={() => setCurrentDay(i)}
            className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              i === currentDay
                ? "bg-accent-gradient text-white shadow-glow"
                : "bg-surface/40 text-muted hover:text-text"
            }`}
          >
            <span>{d.short}</span>
            {plan.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  askDeleteDay(i);
                }}
                className={`grid h-4 w-4 cursor-pointer place-items-center rounded-full text-[10px] transition-opacity ${
                  i === currentDay ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                aria-label={t("common.delete")}
              >
                ✕
              </span>
            )}
          </button>
        ))}
        {plan.length < 7 && (
          <button
            onClick={askAddDay}
            className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-border text-muted transition-all hover:border-accent hover:text-accent"
            aria-label={t("training.addDay")}
          >
            +
          </button>
        )}
      </div>

      {/* Day card */}
      {day && (
        <motion.div
          key={currentDay}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="card overflow-hidden p-5 sm:p-7"
        >
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="heading-display text-2xl font-bold sm:text-3xl">{day.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {day.exercises.length} {t("training.exercisesShort")} · {done}/{total}{" "}
                {t("training.setsTotal")}
              </p>
            </div>
            <button
              onClick={() => editDay(currentDay)}
              className="btn"
              data-tour="edit-day"
            >
              {t("training.editDay")}
            </button>
          </div>

          {/* progress bar */}
          <div className="mb-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dayPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full bg-accent-gradient"
              />
            </div>
          </div>

          {/* Exercise list */}
          <Reorder.Group
            data-tour="exercises"
            axis="y"
            values={day.exercises}
            onReorder={(next) => reorderExercises(currentDay, next)}
            className="flex flex-col gap-3"
          >
            {day.exercises.map((ex, ei) => {
              const state = setStates[setKey(currentDay, ei)] ?? [];
              const weight = weights[weightKey(currentDay, ei)] || "";
              return (
                <ExerciseCard
                  key={ex.name + "-" + ei}
                  ex={ex}
                  ei={ei}
                  di={currentDay}
                  state={state}
                  weight={weight}
                  isPR={isPR(ex.name, parseFloat(weight))}
                  lastWeight={getLastWeight(ex.name)}
                  suggestion={getWeightSuggestion(ex.name)}
                  onOpen={() => setDrawerEx({ di: currentDay, ei })}
                  onWeightChange={(v) => setWeight(currentDay, ei, v)}
                />
              );
            })}
          </Reorder.Group>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div data-tour="presets" className="flex flex-wrap items-center gap-2">
              <button data-tour="complete-day" onClick={completeDay} className="btn btn-success">
                {t("training.completeDay")}
              </button>
              <button onClick={askSavePreset} className="btn">
                {t("training.savePreset")}
              </button>
              <button
                onClick={async () => {
                  const text = formatPlan(plan, locale);
                  const result = await shareOrCopy(text, t("training.title"));
                  if (result === "copied") toast(t("toast.copied"));
                  else if (result === "failed") toast(t("toast.shareFailed"));
                }}
                className="btn"
              >
                {t("training.share")}
              </button>
              <button
                onClick={() => {
                  open(
                    <ProgramsModal
                      onPick={(p) => {
                        loadProgram(p);
                        close();
                        toast(t("programs.loaded"));
                      }}
                      onClose={close}
                    />,
                  );
                }}
                className="btn"
              >
                {t("training.programs")}
              </button>
              <PresetSelect
                presets={Object.keys(presets)}
                onLoad={askLoadPreset}
                onDelete={(name) => {
                  open(
                    <ConfirmModal
                      title={`Удалить пресет «${name}»?`}
                      confirmLabel="Удалить"
                      confirmVariant="danger"
                      onConfirm={() => {
                        deletePreset(name);
                        close();
                      }}
                      onCancel={close}
                    />,
                  );
                }}
              />
            </div>
            <button onClick={askResetDay} className="btn btn-danger">
              {t("training.resetDay")}
            </button>
          </div>
        </motion.div>
      )}

      <ExerciseDrawer
        open={drawerEx !== null}
        di={drawerEx?.di ?? null}
        ei={drawerEx?.ei ?? null}
        onClose={() => setDrawerEx(null)}
      />
    </section>
  );
}

function ExerciseCard({
  ex,
  ei,
  di,
  state,
  weight,
  isPR,
  lastWeight,
  suggestion,
  onOpen,
  onWeightChange,
}: {
  ex: Exercise;
  ei: number;
  di: number;
  state: boolean[];
  weight: string;
  isPR: boolean;
  lastWeight: string | null;
  suggestion: number | null;
  onOpen: () => void;
  onWeightChange: (v: string) => void;
}) {
  const dragControls = useDragControls();
  const { t } = useLocale();
  const exDone = state.filter(Boolean).length;
  const exPct = ex.sets > 0 ? Math.round((exDone / ex.sets) * 100) : 0;
  const allDone = exDone >= ex.sets;
  const showLastHint = !weight && lastWeight && !allDone;

  return (
    <Reorder.Item
      value={ex}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.03,
        zIndex: 10,
        boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
        cursor: "grabbing",
      }}
      transition={{ type: "spring", damping: 28, stiffness: 400 }}
      className="list-none"
    >
      <button
        onClick={onOpen}
        {...(ei === 0 ? { "data-tour": "exercise-card" } : {})}
        className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all ${
          allDone
            ? "border-success/30 bg-success/5"
            : "border-border/60 bg-surface/30 hover:border-accent/40"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            {/* Drag handle */}
            <span
              onPointerDown={(e) => {
                e.stopPropagation();
                dragControls.start(e);
              }}
              onClick={(e) => e.stopPropagation()}
              className="-ml-1 mt-0.5 grid h-9 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted/70 transition-colors hover:bg-surface/60 hover:text-text active:cursor-grabbing active:bg-surface"
              aria-label="Drag"
              title="Перетащить"
            >
              <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
                <circle cx="3" cy="3" r="1.6" />
                <circle cx="3" cy="9" r="1.6" />
                <circle cx="3" cy="15" r="1.6" />
                <circle cx="11" cy="3" r="1.6" />
                <circle cx="11" cy="9" r="1.6" />
                <circle cx="11" cy="15" r="1.6" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h4
                className={`flex items-center gap-1.5 text-base font-medium leading-tight ${
                  allDone ? "text-muted line-through" : ""
                }`}
              >
                <span className="truncate">{ex.name}</span>
                {isPR && (
                  <span
                    className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300"
                    title={t("progress.prs.title")}
                  >
                    🏆 PR
                  </span>
                )}
              </h4>
              <span className="mt-1 inline-block rounded-full border border-border/60 bg-surface/40 px-2 py-0.5 text-[11px] text-muted">
                {ex.target}
              </span>
            </div>
          </div>
          <div
            className="flex flex-col items-end gap-1"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            {...(ei === 0 ? { "data-tour": "weight-input" } : {})}
          >
            <div className="flex items-center gap-1.5">
              <input
                className="h-8 w-14 rounded-lg border border-border/60 bg-surface/40 px-2 text-center text-xs text-text outline-none focus:border-accent/60"
                type="number"
                placeholder={lastWeight || "0"}
                min={0}
                step={0.5}
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
              />
              <span className="text-[10px] text-muted">{t("common.kg")}</span>
            </div>
            {!weight && suggestion !== null && !allDone ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onWeightChange(String(suggestion));
                }}
                title={t("suggest.tooltip")}
                className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success transition-colors hover:bg-success/20"
              >
                ↑ {t("suggest.tryWeight", { n: suggestion })}
              </button>
            ) : showLastHint ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onWeightChange(lastWeight!);
                }}
                className="text-[9px] uppercase tracking-wider text-accent2/80 transition-colors hover:text-accent2"
              >
                ← {lastWeight} {t("common.kg")}
              </button>
            ) : null}
          </div>
        </div>

        {/* set dots */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: ex.sets }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                state[i] ? "bg-accent-gradient" : "bg-border/60"
              }`}
            />
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <span>
            {exDone}/{ex.sets}
          </span>
          <span className="font-medium text-accent2">{exPct}%</span>
        </div>
      </button>
    </Reorder.Item>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent2">
        {eyebrow}
      </span>
      <h2 className="heading-display mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
    </div>
  );
}

function PresetSelect({
  presets,
  onLoad,
  onDelete,
}: {
  presets: string[];
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  if (presets.length === 0) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="btn">
        {t("training.presetsCount")} ({presets.length})
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-border/60 bg-surface/95 p-1 shadow-soft backdrop-blur-xl"
          >
            {presets.map((p) => (
              <div
                key={p}
                className="flex items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-bg/60"
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    onLoad(p);
                  }}
                  className="flex-1 truncate px-2 py-1 text-left text-sm"
                >
                  {p}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onDelete(p);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-lg text-xs text-muted hover:bg-danger/10 hover:text-danger"
                  aria-label={t("common.delete")}
                >
                  ✕
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddDayModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string, short: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [short, setShort] = useState("");
  const { toast } = useToast();
  const { t } = useLocale();
  return (
    <div>
      <h3 className="heading-display mb-4 text-2xl font-bold">{t("training.addDay.title")}</h3>
      <div className="mb-3">
        <span className="label">{t("training.addDay.name")}</span>
        <input
          autoFocus
          className="input"
          placeholder="ГРУДЬ / ТРИЦЕПС"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-5">
        <span className="label">{t("training.addDay.short")}</span>
        <input
          className="input"
          placeholder="Грудь"
          value={short}
          onChange={(e) => setShort(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn">
          {t("common.cancel")}
        </button>
        <button
          onClick={() => {
            if (!name.trim() || !short.trim()) {
              toast(t("training.addDay.fillBoth"));
              return;
            }
            onConfirm(name.trim(), short.trim());
          }}
          className="btn btn-primary"
        >
          {t("training.addDay.confirm")}
        </button>
      </div>
    </div>
  );
}

function PresetSaveModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const { toast } = useToast();
  const { t } = useLocale();
  return (
    <div>
      <h3 className="heading-display mb-4 text-2xl font-bold">{t("training.preset.save.title")}</h3>
      <span className="label">{t("training.addDay.name")}</span>
      <input
        autoFocus
        className="input"
        placeholder={t("training.preset.placeholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="btn">
          {t("common.cancel")}
        </button>
        <button
          onClick={() => {
            if (!name.trim()) {
              toast(t("training.preset.enterName"));
              return;
            }
            onConfirm(name.trim());
          }}
          className="btn btn-primary"
        >
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  return (
    <div>
      <h3 className="heading-display mb-2 text-2xl font-bold">{title}</h3>
      {description && <p className="mb-4 text-sm text-muted">{description}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="btn">
          {t("common.cancel")}
        </button>
        <button
          onClick={onConfirm}
          className={`btn ${confirmVariant === "danger" ? "btn-danger" : "btn-primary"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
