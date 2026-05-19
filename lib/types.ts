export type Exercise = {
  name: string;
  sets: number;
  target: string;
  /** Stable identity for drag-and-drop. Auto-assigned on hydrate / add. */
  _id?: string;
};

export type Day = {
  name: string;
  short: string;
  exercises: Exercise[];
};

export type Plan = Day[];

export type StreakData = {
  streak: number;
  lastWeek: string | null;
  total: number;
};

export type WorkoutHistoryEntry = {
  date: string;
  dayName: string;
  short: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    done: number;
    weight: string;
    avgRpe?: number | null;
  }>;
};

export type CalcProfile = {
  gender: "male" | "female";
  age: string;
  weight: string;
  height: string;
  activity: string;
  goal: "cut" | "maintain" | "bulk";
};

export type ThemeName = "midnight" | "dawn" | "ocean" | "forest" | "violet" | "custom";

export type PersonalRecord = {
  weight: number;
  date: string; // ISO date
};

export type PersonalRecords = Record<string, PersonalRecord>;
