"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "onboarding_done_v2";

type Step = {
  title: string;
  description: string;
  icon: string;
  target?: string; // CSS selector for the element to highlight
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
    target: "[data-tour='exercises']",
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

type Rect = { top: number; left: number; width: number; height: number };

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<"bottom" | "top">("bottom");
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  const measureTarget = useCallback((selector?: string) => {
    if (!selector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(selector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });

    // Decide tooltip position
    const viewH = window.innerHeight;
    const elCenter = rect.top + rect.height / 2;
    setTooltipPos(elCenter < viewH / 2 ? "bottom" : "top");

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      measureTarget(STEPS[step].target);
    }, 350); // wait for scroll/animation
    return () => clearTimeout(timer);
  }, [step, show, measureTarget]);

  // Recalculate on resize
  useEffect(() => {
    if (!show) return;
    const handler = () => measureTarget(STEPS[step].target);
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler);
    };
  }, [show, step, measureTarget]);

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

  const current = STEPS[step];

  if (!show) return null;

  // Spotlight cutout for SVG mask
  const pad = 8;
  const spotRect = targetRect
    ? {
        x: targetRect.left - window.scrollX - pad,
        y: targetRect.top - window.scrollY - pad,
        w: targetRect.width + pad * 2,
        h: targetRect.height + pad * 2,
        rx: 16,
      }
    : null;

  // Tooltip position relative to viewport
  const getTooltipStyle = (): React.CSSProperties => {
    if (!spotRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    const gap = 16;
    if (tooltipPos === "bottom") {
      return {
        top: spotRect.y + spotRect.h + gap,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "min(420px, calc(100vw - 32px))",
      };
    }
    return {
      bottom: `calc(100vh - ${spotRect.y}px + ${gap}px)`,
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: "min(420px, calc(100vw - 32px))",
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300]"
        style={{ pointerEvents: "auto" }}
      >
        {/* Dark overlay with spotlight cutout */}
        <svg
          className="absolute inset-0 h-full w-full"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotRect && (
                <rect
                  x={spotRect.x}
                  y={spotRect.y}
                  width={spotRect.w}
                  height={spotRect.h}
                  rx={spotRect.rx}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight border glow */}
        {spotRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="pointer-events-none absolute rounded-2xl border-2 border-accent shadow-glow"
            style={{
              top: spotRect.y,
              left: spotRect.x,
              width: spotRect.w,
              height: spotRect.h,
            }}
          />
        )}

        {/* Arrow pointing to target */}
        {spotRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute"
            style={{
              left: spotRect.x + spotRect.w / 2 - 8,
              ...(tooltipPos === "bottom"
                ? { top: spotRect.y + spotRect.h + 2 }
                : { top: spotRect.y - 18 }),
            }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12">
              {tooltipPos === "bottom" ? (
                <path d="M8 0L16 12H0L8 0Z" fill="rgb(var(--accent))" />
              ) : (
                <path d="M8 12L0 0H16L8 12Z" fill="rgb(var(--accent))" />
              )}
            </svg>
          </motion.div>
        )}

        {/* Tooltip card */}
        <motion.div
          ref={tooltipRef}
          key={step}
          initial={{ opacity: 0, y: tooltipPos === "bottom" ? 15 : -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: tooltipPos === "bottom" ? 15 : -15 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="absolute z-10 w-full rounded-3xl border border-border/60 bg-bg p-5 shadow-glow sm:p-6"
          style={getTooltipStyle()}
        >
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

          {/* Icon + content */}
          <div className="mb-1 text-center text-3xl">{current.icon}</div>
          <h2 className="heading-display mb-2 text-center text-xl font-bold">
            {current.title}
          </h2>
          <p className="mb-5 text-center text-sm leading-relaxed text-muted">
            {current.description}
          </p>

          {/* Buttons */}
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
      </motion.div>
    </AnimatePresence>
  );
}
