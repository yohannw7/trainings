"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "onboarding_done_v2";

type Step = {
  title: string;
  description: string;
  icon: string;
  target?: string;
};

const STEPS: Step[] = [
  {
    title: "Добро пожаловать! 👋",
    description:
      "ASH TRAIN — твой персональный трекер тренировок. Давай быстро покажу, как тут всё устроено.",
    icon: "🏋️",
  },
  {
    title: "Дни тренировок",
    description:
      "Это кнопки дней. Нажми на день, чтобы переключиться. «+» добавляет новый день, «✕» удаляет.",
    icon: "📅",
    target: "[data-tour='day-pills']",
  },
  {
    title: "Упражнения",
    description:
      "Каждая карточка — упражнение. Нажми на неё, чтобы открыть панель подхода с секундомером и таймером отдыха.",
    icon: "💪",
    target: "[data-tour='exercise-card']",
  },
  {
    title: "Вес",
    description:
      "Поле «кг» справа — твой рабочий вес. Он сохраняется автоматически и попадёт в историю.",
    icon: "⚖️",
    target: "[data-tour='weight-input']",
  },
  {
    title: "Редактирование дня",
    description:
      "Кнопка «Редактировать» — меняй названия, количество подходов и цели для каждого упражнения.",
    icon: "✎",
    target: "[data-tour='edit-day']",
  },
  {
    title: "Таймер и секундомер",
    description:
      "Глобальный таймер с пресетами (30с, 1мин, 2мин…) и секундомер с кругами. Для отдыха или замера времени.",
    icon: "⏱",
    target: "#timer",
  },
  {
    title: "Калькуляторы",
    description:
      "ИМТ, суточная норма калорий (TDEE), БЖУ и максимум на 1 повтор. Заполни профиль один раз — всё подставится.",
    icon: "🧮",
    target: "#calculators",
  },
  {
    title: "Завершить день",
    description:
      "Когда закончишь — нажми эту кнопку. Тренировка попадёт в историю, а стрик 🔥 увеличится.",
    icon: "🔥",
    target: "[data-tour='complete-day']",
  },
  {
    title: "Пресеты и сброс",
    description:
      "«Сохранить пресет» — запоминает план. «Сбросить день» — обнуляет все подходы текущего дня.",
    icon: "💾",
    target: "[data-tour='presets']",
  },
  {
    title: "Настройки и темы",
    description:
      "Шестерёнка — настройки. Там можно выбрать тему: тёмную, светлую, океан, лес или фиолетовую.",
    icon: "🎨",
    target: "[data-tour='settings']",
  },
  {
    title: "Готово! 🚀",
    description:
      "Всё сохраняется в браузере автоматически. Нажми на первое упражнение и начинай. Удачи!",
    icon: "✅",
  },
];

type ViewportRect = { x: number; y: number; w: number; h: number };

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<ViewportRect | null>(null);
  const [tooltipSide, setTooltipSide] = useState<"below" | "above">("below");

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  const measure = useCallback(() => {
    const selector = STEPS[step]?.target;
    if (!selector) {
      setSpot(null);
      return;
    }
    const el = document.querySelector(selector);
    if (!el) {
      setSpot(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 10;
    const viewH = window.innerHeight;
    const tooltipBudget = 280; // approx tooltip height incl. gap

    // If the highlighted element doesn't leave enough room either above or below, drop the spotlight
    const spaceBelow = viewH - (r.bottom + pad);
    const spaceAbove = r.top - pad;
    if (spaceBelow < tooltipBudget && spaceAbove < tooltipBudget) {
      setSpot(null);
      return;
    }

    setSpot({
      x: r.left - pad,
      y: r.top - pad,
      w: r.width + pad * 2,
      h: r.height + pad * 2,
    });
    setTooltipSide(spaceBelow >= tooltipBudget ? "below" : "above");
  }, [step]);

  // Scroll to target and measure
  useEffect(() => {
    if (!show) return;
    const selector = STEPS[step]?.target;
    if (selector) {
      const el = document.querySelector(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        const tooltipBudget = 280;
        // Scroll so target sits in upper third when possible (so tooltip fits below)
        const desiredTop = Math.max(80, (viewH - tooltipBudget - r.height) / 2);
        const delta = r.top - desiredTop;
        window.scrollBy({ top: delta, behavior: "smooth" });
      }
    }
    // Measure after scroll settles
    const t = setTimeout(measure, 450);
    return () => clearTimeout(t);
  }, [step, show, measure]);

  // Re-measure on scroll/resize
  useEffect(() => {
    if (!show) return;
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [show, measure]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!show) return null;

  const current = STEPS[step];
  const hasTarget = !!current.target && !!spot;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] overflow-hidden"
      >
        {/* Overlay with spotlight hole */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <mask id="onboarding-mask">
              <rect width="100%" height="100%" fill="white" />
              {spot && (
                <rect
                  x={spot.x}
                  y={spot.y}
                  width={spot.w}
                  height={spot.h}
                  rx={14}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.78)"
            mask="url(#onboarding-mask)"
          />
        </svg>

        {/* Glow border around target */}
        {spot && (
          <motion.div
            key={`border-${step}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="pointer-events-none absolute rounded-2xl ring-2 ring-accent/80 shadow-glow"
            style={{
              top: spot.y,
              left: spot.x,
              width: spot.w,
              height: spot.h,
            }}
          />
        )}

        {/* Tooltip */}
        <div
          className="pointer-events-none absolute inset-0 flex"
          style={{
            alignItems: !hasTarget
              ? "center"
              : tooltipSide === "below"
                ? "flex-start"
                : "flex-end",
            justifyContent: "center",
            padding: 16,
            paddingTop: hasTarget && tooltipSide === "below" && spot
              ? spot.y + spot.h + 20
              : 16,
            paddingBottom: hasTarget && tooltipSide === "above" && spot
              ? window.innerHeight - spot.y + 20
              : 16,
          }}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: tooltipSide === "below" ? 16 : -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="pointer-events-auto w-full max-w-[400px] rounded-3xl border border-border/60 bg-bg p-5 shadow-glow sm:p-6"
          >
            {/* Arrow pointing to target */}
            {hasTarget && spot && (
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={
                  tooltipSide === "below"
                    ? { top: -10 }
                    : { bottom: -10 }
                }
              >
                <svg width="20" height="10" viewBox="0 0 20 10">
                  {tooltipSide === "below" ? (
                    <path d="M10 0L20 10H0L10 0Z" fill="rgb(var(--accent))" />
                  ) : (
                    <path d="M10 10L0 0H20L10 10Z" fill="rgb(var(--accent))" />
                  )}
                </svg>
              </div>
            )}

            {/* Progress dots */}
            <div className="mb-4 flex items-center justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 bg-accent-gradient"
                      : i < step
                        ? "w-1.5 bg-accent/50"
                        : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            <div className="mb-1 text-center text-3xl">{current.icon}</div>
            <h2 className="heading-display mb-2 text-center text-xl font-bold">
              {current.title}
            </h2>
            <p className="mb-5 text-center text-sm leading-relaxed text-muted">
              {current.description}
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={finish}
                className="text-xs text-muted transition-colors hover:text-text"
              >
                Пропустить
              </button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={prev} className="btn px-3 py-2 text-sm">
                    ←
                  </button>
                )}
                <button onClick={next} className="btn btn-primary px-4 py-2 text-sm">
                  {step === STEPS.length - 1 ? "Начать!" : "Далее →"}
                </button>
              </div>
            </div>

            <div className="mt-3 text-center text-[10px] text-muted/50">
              {step + 1} / {STEPS.length}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
