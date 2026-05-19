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
  PRS: "personalRecords_v1",
  RPE_ENABLED: "rpeEnabled_v1",
} as const;

export const setKey = (d: number, e: number) => `wt2_d${d}_e${e}`;
export const weightKey = (d: number, e: number) => `wt2_d${d}_e${e}_w`;
export const rpeKey = (d: number, e: number) => `wt2_d${d}_e${e}_rpe`;

// ── Built-in programs ──
export const BUILTIN_PROGRAMS: Record<string, Plan> = {
  "Push / Pull / Legs (3 дня)": [
    {
      name: "PUSH (ГРУДЬ / ПЛЕЧИ / ТРИЦЕПС)",
      short: "Push",
      exercises: [
        { name: "Жим лёжа", sets: 4, target: "6–8" },
        { name: "Жим гантелей на наклонной", sets: 3, target: "8–10" },
        { name: "Жим стоя", sets: 4, target: "6–8" },
        { name: "Разводка гантелей в стороны", sets: 3, target: "12–15" },
        { name: "Французский жим", sets: 3, target: "10–12" },
        { name: "Разгибания на трицепс на блоке", sets: 3, target: "12" },
      ],
    },
    {
      name: "PULL (СПИНА / БИЦЕПС)",
      short: "Pull",
      exercises: [
        { name: "Подтягивания", sets: 4, target: "макс." },
        { name: "Тяга штанги в наклоне", sets: 4, target: "6–8" },
        { name: "Тяга вертикального блока", sets: 3, target: "10–12" },
        { name: "Тяга гантели одной рукой", sets: 3, target: "10" },
        { name: "Сгибания на бицепс со штангой", sets: 3, target: "10" },
        { name: "Молотковые сгибания", sets: 3, target: "12" },
      ],
    },
    {
      name: "LEGS (НОГИ)",
      short: "Legs",
      exercises: [
        { name: "Приседания со штангой", sets: 4, target: "6–8" },
        { name: "Румынская тяга", sets: 4, target: "8–10" },
        { name: "Жим ногами", sets: 3, target: "10–12" },
        { name: "Выпады с гантелями", sets: 3, target: "10" },
        { name: "Подъёмы на носки", sets: 4, target: "15" },
      ],
    },
  ],

  "Upper / Lower (4 дня)": [
    {
      name: "UPPER A (СИЛА)",
      short: "Up A",
      exercises: [
        { name: "Жим лёжа", sets: 4, target: "5" },
        { name: "Тяга штанги", sets: 4, target: "5" },
        { name: "Жим стоя", sets: 3, target: "8" },
        { name: "Подтягивания", sets: 3, target: "макс." },
        { name: "Сгибания на бицепс", sets: 3, target: "10" },
      ],
    },
    {
      name: "LOWER A (СИЛА)",
      short: "Low A",
      exercises: [
        { name: "Приседания", sets: 4, target: "5" },
        { name: "Румынская тяга", sets: 3, target: "8" },
        { name: "Жим ногами", sets: 3, target: "10" },
        { name: "Подъёмы на носки", sets: 4, target: "12" },
        { name: "Планка", sets: 3, target: "60 сек" },
      ],
    },
    {
      name: "UPPER B (ОБЪЁМ)",
      short: "Up B",
      exercises: [
        { name: "Жим гантелей на наклонной", sets: 4, target: "10" },
        { name: "Тяга гантели в наклоне", sets: 4, target: "10" },
        { name: "Разводка в стороны", sets: 3, target: "12" },
        { name: "Тяга вертикального блока", sets: 3, target: "12" },
        { name: "Французский жим", sets: 3, target: "12" },
        { name: "Молотковые сгибания", sets: 3, target: "12" },
      ],
    },
    {
      name: "LOWER B (ОБЪЁМ)",
      short: "Low B",
      exercises: [
        { name: "Становая тяга", sets: 4, target: "5" },
        { name: "Болгарские приседания", sets: 3, target: "10" },
        { name: "Сгибания ног", sets: 3, target: "12" },
        { name: "Разгибания ног", sets: 3, target: "12" },
        { name: "Подъёмы на носки сидя", sets: 4, target: "15" },
      ],
    },
  ],

  "Full Body (для новичков, 3 дня)": [
    {
      name: "ДЕНЬ A",
      short: "A",
      exercises: [
        { name: "Приседания", sets: 3, target: "10" },
        { name: "Жим лёжа", sets: 3, target: "8–10" },
        { name: "Тяга гантели в наклоне", sets: 3, target: "10" },
        { name: "Жим стоя", sets: 2, target: "10" },
        { name: "Планка", sets: 3, target: "30–45 сек" },
      ],
    },
    {
      name: "ДЕНЬ B",
      short: "B",
      exercises: [
        { name: "Становая тяга", sets: 3, target: "8" },
        { name: "Отжимания", sets: 3, target: "макс." },
        { name: "Подтягивания / тяга блока", sets: 3, target: "8–10" },
        { name: "Выпады", sets: 3, target: "10" },
        { name: "Скручивания", sets: 3, target: "15" },
      ],
    },
    {
      name: "ДЕНЬ C",
      short: "C",
      exercises: [
        { name: "Жим гантелей на наклонной", sets: 3, target: "10" },
        { name: "Румынская тяга", sets: 3, target: "10" },
        { name: "Жим ногами", sets: 3, target: "12" },
        { name: "Тяга вертикального блока", sets: 3, target: "10" },
        { name: "Сгибания на бицепс", sets: 2, target: "12" },
      ],
    },
  ],

  "Дома без железа (4 дня)": [
    {
      name: "ВЕРХ — ТОЛКАЮЩИЕ",
      short: "Push",
      exercises: [
        { name: "Отжимания", sets: 4, target: "макс." },
        { name: "Отжимания с возвышения", sets: 3, target: "12" },
        { name: "Отжимания узким хватом", sets: 3, target: "10" },
        { name: "Отжимания на одной руке (асс.)", sets: 3, target: "5" },
        { name: "Планка с отжиманиями", sets: 3, target: "30 сек" },
      ],
    },
    {
      name: "ВЕРХ — ТЯНУЩИЕ",
      short: "Pull",
      exercises: [
        { name: "Подтягивания широким хватом", sets: 4, target: "макс." },
        { name: "Подтягивания обратным хватом", sets: 3, target: "макс." },
        { name: "Австралийские подтягивания", sets: 3, target: "12" },
        { name: "Подъём ног в висе", sets: 3, target: "10" },
      ],
    },
    {
      name: "НОГИ",
      short: "Legs",
      exercises: [
        { name: "Приседания", sets: 4, target: "20" },
        { name: "Болгарские приседания", sets: 3, target: "12" },
        { name: "Выпады в шаге", sets: 3, target: "10" },
        { name: "Ягодичный мост", sets: 3, target: "15" },
        { name: "Подъёмы на носки", sets: 4, target: "20" },
      ],
    },
    {
      name: "КОР И КАРДИО",
      short: "Core",
      exercises: [
        { name: "Планка", sets: 3, target: "60 сек" },
        { name: "Боковая планка", sets: 3, target: "30 сек" },
        { name: "Скручивания", sets: 3, target: "20" },
        { name: "Велосипед", sets: 3, target: "20" },
        { name: "Берпи", sets: 3, target: "10" },
      ],
    },
  ],
};
