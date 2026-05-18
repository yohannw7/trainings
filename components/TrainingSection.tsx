"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { setKey, weightKey } from "@/lib/defaults";
import { useWorkout } from "./WorkoutContext";
import { useModal } from "./ModalProvider";
import { useToast } from "./ToastProvider";
import { ExerciseDrawer } from "./ExerciseDrawer";
import { DayEditorModal } from "./DayEditorModal";

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
    resetDay,
    completeDay,
    setWeight,
    savePreset,
    loadPreset,
    deletePreset,
    presets,
  } = useWorkout();
  const { open, close } = useModal();
  const { toast } = useToast();

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
        title={`Удалить «${plan[di].name}»?`}
        description="Действие нельзя отменить."
        confirmLabel="Удалить"
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
        title="Сбросить прогресс этого дня?"
        description="Все отмеченные подходы и таймер будут обнулены."
        confirmLabel="Сбросить"
        confirmVariant="danger"
        onConfirm={() => {
          resetDay();
          close();
          toast("Прогресс дня сброшен");
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
        title={`Загрузить «${name}»?`}
        description="Текущий план будет заменён. Прогресс сохранится."
        confirmLabel="Загрузить"
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
        eyebrow="01 — Тренировка"
        title="Сегодняшний план"
        description="Выбери день, отметь подходы, отдохни и переходи дальше. Всё сохраняется автоматически."
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
                aria-label="Удалить день"
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
            aria-label="Добавить день"
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
                {day.exercises.length} упр. · {done}/{total} подходов
              </p>
            </div>
            <button
              onClick={() => editDay(currentDay)}
              className="btn"
              data-tour="edit-day"
            >
              ✎ Редактировать
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
          <div data-tour="exercises" className="grid gap-3 sm:grid-cols-2">
            {day.exercises.map((ex, ei) => {
              const state = setStates[setKey(currentDay, ei)] ?? [];
              const exDone = state.filter(Boolean).length;
              const exPct = ex.sets > 0 ? Math.round((exDone / ex.sets) * 100) : 0;
              const allDone = exDone >= ex.sets;
              const weight = weights[weightKey(currentDay, ei)] || "";

              return (
                <motion.button
                  key={ei}
                  layout
                  whileHover={{ y: -2 }}
                  onClick={() => setDrawerEx({ di: currentDay, ei })}
                  {...(ei === 0 ? { "data-tour": "exercise-card" } : {})}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                    allDone
                      ? "border-success/30 bg-success/5"
                      : "border-border/60 bg-surface/30 hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-base font-medium leading-tight ${
                          allDone ? "text-muted line-through" : ""
                        }`}
                      >
                        {ex.name}
                      </h4>
                      <span className="mt-1 inline-block rounded-full border border-border/60 bg-surface/40 px-2 py-0.5 text-[11px] text-muted">
                        {ex.target}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                      {...(ei === 0 ? { "data-tour": "weight-input" } : {})}
                    >
                      <input
                        className="h-8 w-14 rounded-lg border border-border/60 bg-surface/40 px-2 text-center text-xs text-text outline-none focus:border-accent/60"
                        type="number"
                        placeholder="0"
                        min={0}
                        step={0.5}
                        value={weight}
                        onChange={(e) => setWeight(currentDay, ei, e.target.value)}
                      />
                      <span className="text-[10px] text-muted">кг</span>
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
                </motion.button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div data-tour="presets" className="flex flex-wrap items-center gap-2">
              <button data-tour="complete-day" onClick={completeDay} className="btn btn-success">
                ✓ Завершить день
              </button>
              <button onClick={askSavePreset} className="btn">
                💾 Сохранить пресет
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
              Сбросить день
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
  if (presets.length === 0) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="btn">
        ▾ Пресеты ({presets.length})
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
                  aria-label="Удалить пресет"
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
  return (
    <div>
      <h3 className="heading-display mb-4 text-2xl font-bold">Новый день</h3>
      <div className="mb-3">
        <span className="label">Название</span>
        <input
          autoFocus
          className="input"
          placeholder="ГРУДЬ / ТРИЦЕПС"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-5">
        <span className="label">Короткое имя</span>
        <input
          className="input"
          placeholder="Грудь"
          value={short}
          onChange={(e) => setShort(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn">
          Отмена
        </button>
        <button
          onClick={() => {
            if (!name.trim() || !short.trim()) {
              toast("Заполни оба поля");
              return;
            }
            onConfirm(name.trim(), short.trim());
          }}
          className="btn btn-primary"
        >
          Добавить
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
  return (
    <div>
      <h3 className="heading-display mb-4 text-2xl font-bold">Сохранить пресет</h3>
      <span className="label">Название</span>
      <input
        autoFocus
        className="input"
        placeholder="Моя программа"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="btn">
          Отмена
        </button>
        <button
          onClick={() => {
            if (!name.trim()) {
              toast("Введи название");
              return;
            }
            onConfirm(name.trim());
          }}
          className="btn btn-primary"
        >
          Сохранить
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
  return (
    <div>
      <h3 className="heading-display mb-2 text-2xl font-bold">{title}</h3>
      {description && <p className="mb-4 text-sm text-muted">{description}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="btn">
          Отмена
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
