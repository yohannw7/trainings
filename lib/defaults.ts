import type { Plan } from "./types";

export const DEFAULT_PLAN: Plan = [
  {
    name: "ГРУДЬ / ТРИЦЕПС",
    short: "Грудь",
    exercises: [
      { name: "Отжимания широкие", sets: 4, target: "12–15" },
      { name: "Жим гантелей лёжа", sets: 4, target: "10–12" },
      { name: "Разводка гантелей", sets: 3, target: "12" },
      { name: "Отжимания узкие", sets: 3, target: "12" },
      { name: "Французский жим", sets: 3, target: "12" },
    ],
  },
  {
    name: "СПИНА / БИЦЕПС",
    short: "Спина",
    exercises: [
      { name: "Подтягивания широкие", sets: 4, target: "макс." },
      { name: "Подтягивания обр. хватом", sets: 4, target: "макс." },
      { name: "Тяга гантели в наклоне", sets: 4, target: "10–12" },
      { name: "Сгибания на бицепс", sets: 3, target: "12" },
      { name: "Молотковые сгибания", sets: 3, target: "12" },
    ],
  },
  {
    name: "НОГИ / ПЛЕЧИ",
    short: "Ноги",
    exercises: [
      { name: "Приседания с гантелями", sets: 4, target: "15" },
      { name: "Выпады с гантелями", sets: 3, target: "12" },
      { name: "Румынская тяга", sets: 4, target: "12" },
      { name: "Жим сидя над головой", sets: 4, target: "12" },
      { name: "Подъём в стороны", sets: 3, target: "15" },
    ],
  },
  {
    name: "ПОЛНОЕ ТЕЛО",
    short: "Фулл",
    exercises: [
      { name: "Подтягивания", sets: 5, target: "макс." },
      { name: "Отжимания с возвышения", sets: 4, target: "12" },
      { name: "Болгарские приседания", sets: 3, target: "10" },
      { name: "Тяга к подбородку", sets: 3, target: "12" },
      { name: "Планка", sets: 3, target: "45–60 сек" },
    ],
  },
];

export const STORAGE_KEYS = {
  PLAN: "customPlan_v2",
  PRESETS: "planPresets_v2",
  STREAK: "streakData",
  THEME: "selectedTheme_v3",
  WORKOUT_START: "workoutStart",
  REST_TIME: "restTime",
  HISTORY: "workoutHistory",
  CALC_PROFILE: "calcProfile",
} as const;

export const setKey = (d: number, e: number) => `wt2_d${d}_e${e}`;
export const weightKey = (d: number, e: number) => `wt2_d${d}_e${e}_w`;
