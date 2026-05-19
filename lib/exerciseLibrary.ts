export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "glutes"
  | "core"
  | "calves"
  | "cardio";

export type LibraryExercise = {
  name: string;
  nameRu: string;
  muscles: MuscleGroup[];
  defaultSets: number;
  defaultTarget: string;
};

export const MUSCLE_LABELS: Record<MuscleGroup, { ru: string; en: string }> = {
  chest:     { ru: "Грудь",     en: "Chest" },
  back:      { ru: "Спина",     en: "Back" },
  shoulders: { ru: "Плечи",     en: "Shoulders" },
  biceps:    { ru: "Бицепс",    en: "Biceps" },
  triceps:   { ru: "Трицепс",   en: "Triceps" },
  legs:      { ru: "Ноги",      en: "Legs" },
  glutes:    { ru: "Ягодицы",   en: "Glutes" },
  core:      { ru: "Кор",       en: "Core" },
  calves:    { ru: "Икры",      en: "Calves" },
  cardio:    { ru: "Кардио",    en: "Cardio" },
};

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // ── CHEST ──
  { name: "Barbell bench press",         nameRu: "Жим штанги лёжа",              muscles: ["chest","triceps","shoulders"], defaultSets: 4, defaultTarget: "5–8" },
  { name: "Dumbbell bench press",        nameRu: "Жим гантелей лёжа",            muscles: ["chest","triceps"],            defaultSets: 4, defaultTarget: "8–12" },
  { name: "Incline barbell press",       nameRu: "Жим штанги на наклонной",      muscles: ["chest","shoulders"],          defaultSets: 3, defaultTarget: "8–10" },
  { name: "Incline dumbbell press",      nameRu: "Жим гантелей на наклонной",    muscles: ["chest","shoulders"],          defaultSets: 3, defaultTarget: "10–12" },
  { name: "Cable fly",                   nameRu: "Сведение в кроссовере",        muscles: ["chest"],                      defaultSets: 3, defaultTarget: "12–15" },
  { name: "Dumbbell fly",               nameRu: "Разводка гантелей",             muscles: ["chest"],                      defaultSets: 3, defaultTarget: "12" },
  { name: "Wide push-ups",              nameRu: "Отжимания широкие",             muscles: ["chest","triceps"],            defaultSets: 4, defaultTarget: "макс." },
  { name: "Chest dip",                  nameRu: "Отжимания на брусьях (грудь)",  muscles: ["chest","triceps"],            defaultSets: 3, defaultTarget: "10–12" },
  { name: "Push-ups on elevation",      nameRu: "Отжимания с возвышения",        muscles: ["chest","shoulders"],          defaultSets: 3, defaultTarget: "12" },
  { name: "Decline dumbbell press",     nameRu: "Жим гантелей на упадке",        muscles: ["chest","triceps"],            defaultSets: 3, defaultTarget: "10" },

  // ── BACK ──
  { name: "Pull-ups wide grip",         nameRu: "Подтягивания широким хватом",   muscles: ["back","biceps"],              defaultSets: 4, defaultTarget: "макс." },
  { name: "Pull-ups reverse grip",      nameRu: "Подтягивания обратным хватом",  muscles: ["back","biceps"],              defaultSets: 4, defaultTarget: "макс." },
  { name: "Barbell row",                nameRu: "Тяга штанги в наклоне",         muscles: ["back","biceps"],              defaultSets: 4, defaultTarget: "6–8" },
  { name: "Dumbbell row",               nameRu: "Тяга гантели одной рукой",      muscles: ["back"],                       defaultSets: 4, defaultTarget: "10–12" },
  { name: "Lat pulldown",               nameRu: "Тяга верхнего блока",           muscles: ["back","biceps"],              defaultSets: 3, defaultTarget: "10–12" },
  { name: "Seated cable row",           nameRu: "Тяга горизонтального блока",    muscles: ["back","biceps"],              defaultSets: 3, defaultTarget: "10–12" },
  { name: "Australian pull-ups",        nameRu: "Австралийские подтягивания",    muscles: ["back","biceps"],              defaultSets: 3, defaultTarget: "12" },
  { name: "Deadlift",                   nameRu: "Становая тяга",                 muscles: ["back","legs","glutes"],       defaultSets: 4, defaultTarget: "5" },
  { name: "T-bar row",                  nameRu: "Тяга Т-грифа",                  muscles: ["back"],                       defaultSets: 3, defaultTarget: "10" },
  { name: "Face pull",                  nameRu: "Тяга к лицу",                   muscles: ["shoulders","back"],           defaultSets: 3, defaultTarget: "15" },

  // ── SHOULDERS ──
  { name: "Overhead press",             nameRu: "Жим штанги стоя",              muscles: ["shoulders","triceps"],        defaultSets: 4, defaultTarget: "6–8" },
  { name: "Seated dumbbell press",      nameRu: "Жим гантелей сидя",             muscles: ["shoulders","triceps"],        defaultSets: 4, defaultTarget: "10–12" },
  { name: "Lateral raises",             nameRu: "Разведение в стороны",          muscles: ["shoulders"],                  defaultSets: 3, defaultTarget: "12–15" },
  { name: "Front raises",               nameRu: "Подъём перед собой",            muscles: ["shoulders"],                  defaultSets: 3, defaultTarget: "12–15" },
  { name: "Reverse fly",                nameRu: "Разведение в наклоне",          muscles: ["shoulders","back"],           defaultSets: 3, defaultTarget: "15" },
  { name: "Upright row",                nameRu: "Тяга к подбородку",             muscles: ["shoulders","back"],            defaultSets: 3, defaultTarget: "12" },
  { name: "Shoulder shrugs",            nameRu: "Шраги",                         muscles: ["shoulders"],                  defaultSets: 4, defaultTarget: "12–15" },
  { name: "Arnold press",               nameRu: "Жим Арнольда",                  muscles: ["shoulders","triceps"],        defaultSets: 3, defaultTarget: "10–12" },

  // ── BICEPS ──
  { name: "Barbell curl",               nameRu: "Сгибание на бицепс со штангой", muscles: ["biceps"],                     defaultSets: 3, defaultTarget: "10–12" },
  { name: "Dumbbell curl",              nameRu: "Сгибание на бицепс",            muscles: ["biceps"],                     defaultSets: 3, defaultTarget: "10–12" },
  { name: "Hammer curl",                nameRu: "Молотковые сгибания",           muscles: ["biceps"],                     defaultSets: 3, defaultTarget: "12" },
  { name: "Cable curl",                 nameRu: "Сгибание на блоке",             muscles: ["biceps"],                     defaultSets: 3, defaultTarget: "12–15" },
  { name: "Incline dumbbell curl",      nameRu: "Сгибание на скамье Скотта",     muscles: ["biceps"],                     defaultSets: 3, defaultTarget: "10" },
  { name: "Concentration curl",         nameRu: "Концентрированные сгибания",    muscles: ["biceps"],                     defaultSets: 3, defaultTarget: "12" },

  // ── TRICEPS ──
  { name: "Close-grip bench press",     nameRu: "Жим узким хватом",              muscles: ["triceps","chest"],            defaultSets: 3, defaultTarget: "8–10" },
  { name: "French press",               nameRu: "Французский жим",               muscles: ["triceps"],                    defaultSets: 3, defaultTarget: "10–12" },
  { name: "Triceps pushdown",           nameRu: "Разгибания на блоке",           muscles: ["triceps"],                    defaultSets: 3, defaultTarget: "12–15" },
  { name: "Overhead triceps extension", nameRu: "Разгибание над головой",        muscles: ["triceps"],                    defaultSets: 3, defaultTarget: "12" },
  { name: "Diamond push-ups",           nameRu: "Отжимания узким хватом",        muscles: ["triceps","chest"],            defaultSets: 3, defaultTarget: "12–15" },
  { name: "Skull crushers",             nameRu: "Разгибание лёжа (EZ-гриф)",     muscles: ["triceps"],                    defaultSets: 3, defaultTarget: "10–12" },

  // ── LEGS ──
  { name: "Barbell squat",              nameRu: "Приседания со штангой",         muscles: ["legs","glutes"],              defaultSets: 4, defaultTarget: "5–8" },
  { name: "Dumbbell squat",             nameRu: "Приседания с гантелями",        muscles: ["legs","glutes"],              defaultSets: 4, defaultTarget: "12–15" },
  { name: "Romanian deadlift",          nameRu: "Румынская тяга",                muscles: ["legs","glutes","back"],       defaultSets: 4, defaultTarget: "8–12" },
  { name: "Leg press",                  nameRu: "Жим ногами",                    muscles: ["legs","glutes"],              defaultSets: 3, defaultTarget: "10–12" },
  { name: "Lunges",                     nameRu: "Выпады с гантелями",            muscles: ["legs","glutes"],              defaultSets: 3, defaultTarget: "10–12" },
  { name: "Bulgarian split squat",      nameRu: "Болгарские приседания",         muscles: ["legs","glutes"],              defaultSets: 3, defaultTarget: "10" },
  { name: "Leg curl",                   nameRu: "Сгибание ног лёжа",             muscles: ["legs"],                       defaultSets: 3, defaultTarget: "12" },
  { name: "Leg extension",              nameRu: "Разгибание ног",                muscles: ["legs"],                       defaultSets: 3, defaultTarget: "12–15" },
  { name: "Hack squat",                 nameRu: "Гакк-приседания",               muscles: ["legs"],                       defaultSets: 3, defaultTarget: "10" },
  { name: "Step-ups",                   nameRu: "Зашагивания на платформу",      muscles: ["legs","glutes"],              defaultSets: 3, defaultTarget: "12" },

  // ── GLUTES ──
  { name: "Hip thrust",                 nameRu: "Ягодичный мост со штангой",     muscles: ["glutes","legs"],              defaultSets: 4, defaultTarget: "10–12" },
  { name: "Glute bridge",               nameRu: "Ягодичный мост",                muscles: ["glutes"],                     defaultSets: 3, defaultTarget: "15" },
  { name: "Cable kickback",             nameRu: "Отведение ноги на блоке",       muscles: ["glutes"],                     defaultSets: 3, defaultTarget: "15" },
  { name: "Sumo squat",                 nameRu: "Приседания сумо",               muscles: ["glutes","legs"],              defaultSets: 3, defaultTarget: "12" },

  // ── CORE ──
  { name: "Plank",                      nameRu: "Планка",                        muscles: ["core"],                       defaultSets: 3, defaultTarget: "45–60 сек" },
  { name: "Side plank",                 nameRu: "Боковая планка",                muscles: ["core"],                       defaultSets: 3, defaultTarget: "30 сек" },
  { name: "Crunches",                   nameRu: "Скручивания",                   muscles: ["core"],                       defaultSets: 3, defaultTarget: "20" },
  { name: "Bicycle crunch",             nameRu: "Велосипед",                     muscles: ["core"],                       defaultSets: 3, defaultTarget: "20" },
  { name: "Hanging leg raise",          nameRu: "Подъём ног в висе",             muscles: ["core"],                       defaultSets: 3, defaultTarget: "10–12" },
  { name: "Russian twist",              nameRu: "Русские скручивания",           muscles: ["core"],                       defaultSets: 3, defaultTarget: "20" },
  { name: "Ab rollout",                 nameRu: "Ролик",                         muscles: ["core"],                       defaultSets: 3, defaultTarget: "10" },
  { name: "Mountain climbers",          nameRu: "Бегущий альпинист",             muscles: ["core","cardio"],              defaultSets: 3, defaultTarget: "30 сек" },

  // ── CALVES ──
  { name: "Standing calf raise",        nameRu: "Подъём на носки стоя",         muscles: ["calves"],                     defaultSets: 4, defaultTarget: "15–20" },
  { name: "Seated calf raise",          nameRu: "Подъём на носки сидя",         muscles: ["calves"],                     defaultSets: 4, defaultTarget: "15–20" },

  // ── CARDIO ──
  { name: "Burpee",                     nameRu: "Берпи",                         muscles: ["cardio","core","chest"],      defaultSets: 3, defaultTarget: "10" },
  { name: "Jump rope",                  nameRu: "Прыжки на скакалке",            muscles: ["cardio","calves"],            defaultSets: 3, defaultTarget: "60 сек" },
  { name: "Box jump",                   nameRu: "Запрыгивание на платформу",     muscles: ["cardio","legs"],              defaultSets: 3, defaultTarget: "10" },
];

export function searchExercises(query: string, locale: "ru" | "en"): LibraryExercise[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return EXERCISE_LIBRARY.filter((ex) => {
    const name = locale === "ru" ? ex.nameRu : ex.name;
    return name.toLowerCase().includes(q) || ex.name.toLowerCase().includes(q);
  }).slice(0, 8);
}
