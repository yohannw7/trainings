export type Locale = "ru" | "en";

export const LOCALES: Locale[] = ["ru", "en"];

const dict = {
  // Common
  "common.cancel": { ru: "Отмена", en: "Cancel" },
  "common.save": { ru: "Сохранить", en: "Save" },
  "common.delete": { ru: "Удалить", en: "Delete" },
  "common.close": { ru: "Закрыть", en: "Close" },
  "common.confirm": { ru: "Подтвердить", en: "Confirm" },
  "common.back": { ru: "← Назад", en: "← Back" },
  "common.next": { ru: "Далее →", en: "Next →" },
  "common.skip": { ru: "Пропустить", en: "Skip" },
  "common.start": { ru: "Старт", en: "Start" },
  "common.pause": { ru: "Пауза", en: "Pause" },
  "common.resume": { ru: "Продолжить", en: "Resume" },
  "common.reset": { ru: "Сброс", en: "Reset" },
  "common.lap": { ru: "Круг", en: "Lap" },
  "common.kg": { ru: "кг", en: "kg" },
  "common.sec": { ru: "сек", en: "sec" },
  "common.min": { ru: "мин", en: "min" },
  "common.hour": { ru: "ч", en: "h" },
  "common.weeks": { ru: "нед.", en: "wk" },
  "common.weeksLong": { ru: "недель подряд", en: "weeks streak" },
  "common.workouts": { ru: "тренировок", en: "workouts" },
  "common.total": { ru: "всего", en: "total" },
  "common.done": { ru: "Готово!", en: "Done!" },
  "common.cancel.short": { ru: "Отмена", en: "Cancel" },

  // Header
  "nav.training": { ru: "Тренировка", en: "Training" },
  "nav.calculators": { ru: "Калькуляторы", en: "Calculators" },
  "nav.progress": { ru: "Прогресс", en: "Progress" },
  "header.settings": { ru: "Настройки", en: "Settings" },

  // Hero
  "hero.activeSession": { ru: "Активная сессия", en: "Active session" },
  "hero.title.before": { ru: "Тренируйся ", en: "Train " },
  "hero.title.accent": { ru: "осознанно", en: "with intent" },
  "hero.title.after": {
    ru: ", а не на автомате",
    en: ", not on autopilot",
  },
  "hero.description": {
    ru: "Простой трекер с подходами, секундомером, отдыхом, статистикой и калькуляторами. Всё, что нужно — на одном экране.",
    en: "Simple tracker with sets, stopwatch, rest timer, stats and calculators. Everything you need on one screen.",
  },
  "hero.stat.streak": { ru: "Стрик", en: "Streak" },
  "hero.stat.streak.hint": { ru: "недель подряд", en: "weeks in a row" },
  "hero.stat.workouts": { ru: "Тренировок", en: "Workouts" },
  "hero.stat.workouts.hint": { ru: "всего", en: "total" },
  "hero.stat.progress": { ru: "Прогресс", en: "Progress" },
  "hero.stat.time": { ru: "Время", en: "Time" },
  "hero.stat.time.hint": { ru: "в сессии", en: "in session" },

  // Training
  "training.eyebrow": { ru: "01 — Тренировка", en: "01 — Training" },
  "training.title": { ru: "Сегодняшний план", en: "Today's plan" },
  "training.description": {
    ru: "Выбери день, отметь подходы, отдохни и переходи дальше. Всё сохраняется автоматически.",
    en: "Pick a day, log sets, rest and move on. Everything saves automatically.",
  },
  "training.exercisesShort": { ru: "упр.", en: "ex." },
  "training.setsTotal": { ru: "подходов", en: "sets" },
  "training.editDay": { ru: "✎ Редактировать", en: "✎ Edit" },
  "training.completeDay": { ru: "✓ Завершить день", en: "✓ Complete day" },
  "training.savePreset": { ru: "💾 Сохранить пресет", en: "💾 Save preset" },
  "training.programs": { ru: "📚 Программы", en: "📚 Programs" },
  "training.resetDay": { ru: "Сбросить день", en: "Reset day" },
  "training.presetsCount": { ru: "▾ Пресеты", en: "▾ Presets" },
  "training.addDay": { ru: "Добавить день", en: "Add day" },
  "training.addDay.title": { ru: "Новый день", en: "New day" },
  "training.addDay.name": { ru: "Название", en: "Name" },
  "training.addDay.short": { ru: "Короткое имя", en: "Short label" },
  "training.addDay.fillBoth": { ru: "Заполни оба поля", en: "Fill both fields" },
  "training.addDay.confirm": { ru: "Добавить", en: "Add" },
  "training.deleteDay.title": { ru: "Удалить «{name}»?", en: "Delete \"{name}\"?" },
  "training.deleteDay.desc": { ru: "Действие нельзя отменить.", en: "This cannot be undone." },
  "training.maxDays": { ru: "Максимум 7 дней", en: "Maximum 7 days" },
  "training.minDays": { ru: "Минимум 1 день", en: "At least 1 day required" },
  "training.preset.save.title": { ru: "Сохранить пресет", en: "Save preset" },
  "training.preset.placeholder": { ru: "Моя программа", en: "My program" },
  "training.preset.enterName": { ru: "Введи название", en: "Enter a name" },
  "training.preset.saved": { ru: "Пресет «{name}» сохранён!", en: "Preset \"{name}\" saved!" },
  "training.preset.load.title": { ru: "Загрузить «{name}»?", en: "Load \"{name}\"?" },
  "training.preset.load.desc": {
    ru: "Текущий план будет заменён. Прогресс сохранится.",
    en: "Current plan will be replaced. Progress is kept.",
  },
  "training.preset.loaded": { ru: "Загружено: «{name}»", en: "Loaded: \"{name}\"" },
  "training.preset.delete.title": {
    ru: "Удалить пресет «{name}»?",
    en: "Delete preset \"{name}\"?",
  },
  "training.reset.title": {
    ru: "Сбросить прогресс этого дня?",
    en: "Reset today's progress?",
  },
  "training.reset.desc": {
    ru: "Все отмеченные подходы и таймер будут обнулены.",
    en: "All logged sets and the timer will be reset.",
  },
  "training.reset.confirm": { ru: "Сбросить", en: "Reset" },
  "training.reset.toast": { ru: "Прогресс дня сброшен", en: "Day progress reset" },

  // Day editor
  "editor.title": { ru: "Редактирование дня", en: "Edit day" },
  "editor.exercises": { ru: "Упражнения", en: "Exercises" },
  "editor.exName": { ru: "Название", en: "Name" },
  "editor.exSets": { ru: "Подх.", en: "Sets" },
  "editor.exTarget": { ru: "Цель", en: "Target" },
  "editor.addEx": { ru: "+ Упражнение", en: "+ Exercise" },
  "editor.fillNames": { ru: "Заполни названия!", en: "Fill in the names!" },
  "editor.minOne": { ru: "Минимум 1 упражнение!", en: "At least 1 exercise!" },
  "editor.target.default": { ru: "повт.", en: "reps" },

  // Exercise drawer
  "drawer.target": { ru: "{target} · {done}/{total} подходов", en: "{target} · {done}/{total} sets" },
  "drawer.allDone": { ru: "✅ Все подходы выполнены!", en: "✅ All sets done!" },
  "drawer.startApproach": { ru: "▶ Начать подход", en: "▶ Start set" },
  "drawer.startCountdown": { ru: "Старт через {n}…", en: "Starting in {n}…" },
  "drawer.finish": { ru: "✓ Завершить", en: "✓ Finish" },
  "drawer.getReady": { ru: "Приготовься", en: "Get ready" },
  "drawer.setTime": { ru: "Время подхода", en: "Set time" },
  "drawer.rest": { ru: "Отдых", en: "Rest" },
  "drawer.restSetup": { ru: "Отдых перед подходом (сек)", en: "Rest before set (sec)" },
  "drawer.undoLast": { ru: "↩ Отменить последний", en: "↩ Undo last" },

  // Timer
  "timer.eyebrow": { ru: "02 — Время", en: "02 — Time" },
  "timer.title": { ru: "Таймер и секундомер", en: "Timer & stopwatch" },
  "timer.description": {
    ru: "Контролируй интервалы отдыха и точно измеряй любые активности.",
    en: "Control rest intervals and precisely time anything.",
  },
  "timer.modeTimer": { ru: "⏲ Таймер", en: "⏲ Timer" },
  "timer.modeStopwatch": { ru: "⏱ Секундомер", en: "⏱ Stopwatch" },
  "timer.running": { ru: "Идёт", en: "Running" },
  "timer.ready": { ru: "Готов", en: "Ready" },
  "timer.stopwatch": { ru: "Секундомер", en: "Stopwatch" },

  // Calculators
  "calc.eyebrow": { ru: "03 — Калькуляторы", en: "03 — Calculators" },
  "calc.title": { ru: "Метрики тела", en: "Body metrics" },
  "calc.description": {
    ru: "Введи данные один раз — расчёты обновятся автоматически.",
    en: "Enter your data once — all calculations update automatically.",
  },
  "calc.editProfile": { ru: "✎ Изменить данные", en: "✎ Edit data" },

  "calc.bmi.title": { ru: "ИМТ", en: "BMI" },
  "calc.bmi.desc": { ru: "Индекс массы тела", en: "Body mass index" },
  "calc.bmi.noData": { ru: "Нет данных", en: "No data" },
  "calc.bmi.cat.severe": { ru: "Выраженный дефицит", en: "Severe underweight" },
  "calc.bmi.cat.under": { ru: "Недостаточный", en: "Underweight" },
  "calc.bmi.cat.normal": { ru: "Норма", en: "Normal" },
  "calc.bmi.cat.over": { ru: "Избыточный", en: "Overweight" },
  "calc.bmi.cat.ob1": { ru: "Ожирение I", en: "Obesity I" },
  "calc.bmi.cat.ob2": { ru: "Ожирение II", en: "Obesity II" },
  "calc.bmi.cat.ob3": { ru: "Ожирение III", en: "Obesity III" },

  "calc.tdee.title": { ru: "TDEE", en: "TDEE" },
  "calc.tdee.desc": { ru: "Суточная норма калорий", en: "Daily calorie needs" },
  "calc.tdee.kcal": { ru: "ккал", en: "kcal" },
  "calc.tdee.bmr": { ru: "BMR: {value} ккал", en: "BMR: {value} kcal" },

  "calc.macro.title": { ru: "БЖУ", en: "Macros" },
  "calc.macro.goal.cut": { ru: "сушка", en: "cut" },
  "calc.macro.goal.maintain": { ru: "поддержание", en: "maintenance" },
  "calc.macro.goal.bulk": { ru: "масса", en: "bulk" },
  "calc.macro.goalLabel": { ru: "Цель: {goal}", en: "Goal: {goal}" },
  "calc.macro.p": { ru: "Б", en: "P" },
  "calc.macro.f": { ru: "Ж", en: "F" },
  "calc.macro.c": { ru: "У", en: "C" },
  "calc.macro.gramsShort": { ru: "г", en: "g" },

  "calc.rm.title": { ru: "1 ПМ", en: "1 RM" },
  "calc.rm.desc": { ru: "Максимум на 1 раз (формула Эпли)", en: "One-rep max (Epley formula)" },
  "calc.rm.weight": { ru: "Вес (кг)", en: "Weight (kg)" },
  "calc.rm.reps": { ru: "Повторы", en: "Reps" },

  "calc.profile.title": { ru: "Ваши данные", en: "Your data" },
  "calc.profile.desc": {
    ru: "Подставится во все калькуляторы",
    en: "Auto-applies to all calculators",
  },
  "calc.profile.gender": { ru: "Пол", en: "Gender" },
  "calc.profile.male": { ru: "Мужской", en: "Male" },
  "calc.profile.female": { ru: "Женский", en: "Female" },
  "calc.profile.age": { ru: "Возраст", en: "Age" },
  "calc.profile.weight": { ru: "Вес (кг)", en: "Weight (kg)" },
  "calc.profile.height": { ru: "Рост (см)", en: "Height (cm)" },
  "calc.profile.activity": { ru: "Активность", en: "Activity" },
  "calc.profile.act.sedentary": { ru: "Сидячий образ жизни", en: "Sedentary" },
  "calc.profile.act.light": { ru: "Лёгкая (1-3 дня)", en: "Light (1-3 days)" },
  "calc.profile.act.moderate": { ru: "Умеренная (3-5 дней)", en: "Moderate (3-5 days)" },
  "calc.profile.act.high": { ru: "Высокая (6-7 дней)", en: "High (6-7 days)" },
  "calc.profile.act.extreme": { ru: "Экстремальная", en: "Extreme" },
  "calc.profile.goal": { ru: "Цель", en: "Goal" },
  "calc.profile.goal.cut": { ru: "Сушка", en: "Cut" },
  "calc.profile.goal.maintain": { ru: "Поддержание", en: "Maintenance" },
  "calc.profile.goal.bulk": { ru: "Набор массы", en: "Bulk" },

  // Progress
  "progress.eyebrow": { ru: "04 — История", en: "04 — History" },
  "progress.title": { ru: "Прогресс", en: "Progress" },
  "progress.description": {
    ru: "Активность, личные рекорды и все завершённые тренировки.",
    en: "Activity, personal records and all completed workouts.",
  },
  "progress.empty.title": { ru: "Пока пусто", en: "Nothing yet" },
  "progress.empty.desc": {
    ru: "Заверши первую тренировку — и она появится здесь.",
    en: "Finish your first workout to see it here.",
  },
  "progress.prs.title": { ru: "🏆 Личные рекорды", en: "🏆 Personal records" },
  "progress.prs.count": { ru: "{n} упражнений", en: "{n} exercises" },

  // Heatmap
  "heatmap.title": { ru: "Активность", en: "Activity" },
  "heatmap.subtitle": { ru: "Последние 6 месяцев", en: "Last 6 months" },
  "heatmap.total": { ru: "всего", en: "total" },
  "heatmap.last30": { ru: "за 30 дней", en: "in 30 days" },
  "heatmap.legend.less": { ru: "Меньше", en: "Less" },
  "heatmap.legend.more": { ru: "Больше", en: "More" },

  // Footer
  "footer.tagline": { ru: "Простой трекер тренировок", en: "Simple workout tracker" },

  // Settings modal
  "settings.title": { ru: "Настройки", en: "Settings" },
  "settings.subtitle": { ru: "ASH Train Tracker v2.0", en: "ASH Train Tracker v2.0" },
  "settings.theme": { ru: "Тема оформления", en: "Theme" },
  "settings.language": { ru: "Язык", en: "Language" },
  "settings.langRu": { ru: "Русский", en: "Russian" },
  "settings.langEn": { ru: "Английский", en: "English" },
  "settings.ok": { ru: "Готово", en: "Done" },

  // Programs
  "programs.title": { ru: "Готовые программы", en: "Built-in programs" },
  "programs.description": {
    ru: "Проверенные шаблоны на разные цели. Выбери и нажми «Загрузить».",
    en: "Curated templates for different goals. Pick one and tap \"Load\".",
  },
  "programs.daysShort": { ru: "{n} дн.", en: "{n} days" },
  "programs.preview": { ru: "Превью", en: "Preview" },
  "programs.load": { ru: "Загрузить выбранную", en: "Load selected" },
  "programs.replace.title": { ru: "Заменить текущий план?", en: "Replace current plan?" },
  "programs.replace.desc": {
    ru: "Текущий план будет заменён. Если жалко — сначала сохрани текущий как пресет.",
    en: "Current plan will be replaced. If unsure, save the current one as a preset first.",
  },
  "programs.replace.confirm": { ru: "Загрузить", en: "Load" },
  "programs.loaded": { ru: "Программа загружена", en: "Program loaded" },

  // Onboarding
  "ob.0.title": { ru: "Добро пожаловать! 👋", en: "Welcome! 👋" },
  "ob.0.desc": {
    ru: "ASH TRAIN — твой персональный трекер тренировок. Давай быстро покажу, как тут всё устроено.",
    en: "ASH TRAIN is your personal workout tracker. Let me give you a quick tour.",
  },
  "ob.1.title": { ru: "Дни тренировок", en: "Training days" },
  "ob.1.desc": {
    ru: "Это кнопки дней. Нажми на день, чтобы переключиться. «+» добавляет новый день, «✕» удаляет.",
    en: "These are your training days. Tap to switch. \"+\" adds a new one, \"✕\" deletes.",
  },
  "ob.2.title": { ru: "Упражнения", en: "Exercises" },
  "ob.2.desc": {
    ru: "Каждая карточка — упражнение. Нажми на неё, чтобы открыть панель подхода с секундомером и таймером отдыха.",
    en: "Each card is an exercise. Tap to open the set panel with a stopwatch and rest timer.",
  },
  "ob.3.title": { ru: "Вес", en: "Weight" },
  "ob.3.desc": {
    ru: "Поле «кг» справа — твой рабочий вес. Он сохраняется автоматически и попадёт в историю.",
    en: "The \"kg\" field is your working weight. It saves automatically and goes into history.",
  },
  "ob.4.title": { ru: "Редактирование дня", en: "Edit day" },
  "ob.4.desc": {
    ru: "Кнопка «Редактировать» — меняй названия, количество подходов и цели для каждого упражнения.",
    en: "The Edit button lets you change names, set counts and targets per exercise.",
  },
  "ob.5.title": { ru: "Таймер и секундомер", en: "Timer & stopwatch" },
  "ob.5.desc": {
    ru: "Глобальный таймер с пресетами (30с, 1мин, 2мин…) и секундомер с кругами. Для отдыха или замера времени.",
    en: "Global timer with presets (30s, 1m, 2m…) and a stopwatch with laps. For rest or timing anything.",
  },
  "ob.6.title": { ru: "Калькуляторы", en: "Calculators" },
  "ob.6.desc": {
    ru: "ИМТ, суточная норма калорий (TDEE), БЖУ и максимум на 1 повтор. Заполни профиль один раз — всё подставится.",
    en: "BMI, daily calories (TDEE), macros and one-rep max. Fill the profile once — it auto-fills everywhere.",
  },
  "ob.7.title": { ru: "Завершить день", en: "Complete day" },
  "ob.7.desc": {
    ru: "Когда закончишь — нажми эту кнопку. Тренировка попадёт в историю, а стрик 🔥 увеличится.",
    en: "When you're done, hit this button. The session goes to history and the streak 🔥 grows.",
  },
  "ob.8.title": { ru: "Пресеты и программы", en: "Presets & programs" },
  "ob.8.desc": {
    ru: "«Сохранить пресет» запоминает план. «Программы» — готовые шаблоны. «Сбросить день» обнуляет подходы.",
    en: "\"Save preset\" remembers your plan. \"Programs\" gives you templates. \"Reset day\" clears the sets.",
  },
  "ob.9.title": { ru: "Настройки и темы", en: "Settings & themes" },
  "ob.9.desc": {
    ru: "Шестерёнка — настройки. Там можно выбрать тему и сменить язык.",
    en: "The gear icon opens settings. You can pick a theme and change the language there.",
  },
  "ob.10.title": { ru: "Готово! 🚀", en: "All set! 🚀" },
  "ob.10.desc": {
    ru: "Всё сохраняется в браузере автоматически. Нажми на первое упражнение и начинай. Удачи!",
    en: "Everything saves in your browser automatically. Tap the first exercise and go. Good luck!",
  },
  "ob.start": { ru: "Начать!", en: "Let's go!" },

  // Toasts
  "toast.alreadyMarked": {
    ru: "На этой неделе уже отмечал! 🔥",
    en: "Already logged this week! 🔥",
  },
  "toast.dayDone": {
    ru: "День засчитан! Стрик: {streak} нед.",
    en: "Day logged! Streak: {streak} wk.",
  },
  "toast.duration": { ru: "⏱ {value}", en: "⏱ {value}" },
  "toast.records": { ru: "🏆 {n} рекордов", en: "🏆 {n} PRs" },
  "toast.recordSingle": { ru: "🏆 {n} рекорд", en: "🏆 {n} PR" },
} as const;

type DictKey = keyof typeof dict;

export function translate(locale: Locale, key: DictKey, vars?: Record<string, string | number>) {
  const entry = dict[key];
  if (!entry) return key;
  let str: string = entry[locale] ?? entry.ru;
  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.replaceAll(`{${k}}`, String(vars[k]));
    }
  }
  return str;
}

export function getDefaultLocale(): Locale {
  if (typeof navigator === "undefined") return "ru";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("ru")) return "ru";
  return "en";
}

// Localized formatters
export function formatDurationLocalized(ms: number, locale: Locale): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (locale === "ru") {
    if (h > 0) return `${h}ч ${m}мин`;
    if (m > 0) return `${m}мин ${s}сек`;
    return `${s}сек`;
  }
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
