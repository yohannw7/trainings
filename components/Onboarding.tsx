"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const STORAGE_KEY = "onboarding_done_v2";

const STEPS = [
  {
    title: "Добро пожаловать! 👋",
    description:
      "ASH TRAIN — твой персональный трекер тренировок. Давай быстро покажу, как тут всё устроено.",
    icon: "🏋️",
  },
  {
    title: "Дни тренировок",
    description:
      "Наверху — кнопки с днями (Грудь, Спина, Ноги…). Нажми на день, чтобы переключиться. Можешь добавлять свои дни кнопкой «+» и удалять крестиком.",
    icon: "📅",
  },
  {
    title: "Упражнения и подходы",
    description:
      "Каждая карточка — упражнение. Нажми на неё, чтобы открыть панель подхода. Там ты запускаешь секундомер, завершаешь подход, и автоматически включается таймер отдыха.",
    icon: "💪",
  },
  {
    title: "Вес",
    description:
      "Справа от каждого упражнения — поле «кг». Вводи рабочий вес — он сохранится автоматически и попадёт в историю.",
    icon: "⚖️",
  },
  {
    title: "Таймер и секундомер",
    description:
      "Ниже — глобальный таймер с пресетами (30 сек, 1 мин, 2 мин…) и секундомер с кругами. Используй для отдыха между упражнениями или для замера времени.",
    icon: "⏱",
  },
  {
    title: "Калькуляторы",
    description:
      "Раздел «Метрики тела» считает ИМТ, суточную норму калорий (TDEE), БЖУ и максимум на 1 повтор (1RM). Заполни профиль один раз — всё подставится автоматически.",
    icon: "🧮",
  },
  {
    title: "Завершение дня и стрик",
    description:
      "Когда закончишь — нажми «Завершить день». Тренировка попадёт в историю, а стрик (🔥) увеличится. Стрик считается по неделям: тренируйся хотя бы раз в неделю, чтобы не потерять серию.",
    icon: "🔥",
  },
  {
    title: "Пресеты и сброс",
    description:
      "«Сохранить пресет» — сохраняет текущий план тренировок. «Пресеты» — загружает сохранённый. «Сбросить день» — обнуляет все подходы текущего дня. «Редактировать» — меняет упражнения, подходы и цели.",
    icon: "💾",
  },
  {
    title: "Темы оформления",
    description:
      "Нажми шестерёнку ⚙ в правом верхнем углу — там можно выбрать тему: тёмную, светлую, океан, лес или фиолетовую.",
    icon: "🎨",
  },
  {
    title: "Готово! 🚀",
    description:
      "Всё сохраняется в браузере автоматически. Просто начни тренировку — нажми на первое упражнение. Удачи!",
    icon: "✅",
  },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setShow(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const skip = () => {
    finish();
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-bg p-6 shadow-glow sm:p-8"
          >
            {/* Progress dots */}
            <div className="mb-6 flex items-center justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-6 bg-accent-gradient"
                      : i < step
                        ? "w-1.5 bg-accent/50"
                        : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="mb-4 text-center text-5xl">{current.icon}</div>

            {/* Content */}
            <h2 className="heading-display mb-3 text-center text-2xl font-bold">
              {current.title}
            </h2>
            <p className="mb-8 text-center text-sm leading-relaxed text-muted">
              {current.description}
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={skip}
                className="text-xs text-muted transition-colors hover:text-text"
              >
                Пропустить
              </button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={prev} className="btn px-4 py-2 text-sm">
                    ←
                  </button>
                )}
                <button onClick={next} className="btn btn-primary px-5 py-2.5 text-sm">
                  {step === STEPS.length - 1 ? "Начать!" : "Далее →"}
                </button>
              </div>
            </div>

            {/* Step counter */}
            <div className="mt-4 text-center text-[11px] text-muted/60">
              {step + 1} / {STEPS.length}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
