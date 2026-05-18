"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_PLAN, STORAGE_KEYS, setKey, weightKey } from "@/lib/defaults";
import { readJSON, readString, removeKey, writeJSON, writeString } from "@/lib/storage";
import type { Plan, StreakData, WorkoutHistoryEntry } from "@/lib/types";
import { formatDuration, getWeekId, playBeep, vibrate } from "@/lib/utils";
import { useToast } from "./ToastProvider";

type SetStates = Record<string, boolean[]>;
type Weights = Record<string, string>;

type Ctx = {
  hydrated: boolean;
  plan: Plan;
  currentDay: number;
  setCurrentDay: (d: number) => void;
  setStates: SetStates;
  weights: Weights;
  streak: StreakData;
  workoutSeconds: number;
  history: WorkoutHistoryEntry[];
  presets: Record<string, Plan>;
  restTime: number;

  setRestTime: (n: number) => void;
  toggleSet: (di: number, ei: number) => void;
  setSetState: (di: number, ei: number, idx: number, value: boolean) => void;
  undoLastSet: (di: number, ei: number) => void;
  setWeight: (di: number, ei: number, value: string) => void;

  addDay: (name: string, short: string) => void;
  deleteDay: (di: number) => void;
  saveDayEdit: (di: number, day: Plan[number]) => void;
  resetDay: () => void;
  completeDay: () => void;

  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
};

const WorkoutContext = createContext<Ctx | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [hydrated, setHydrated] = useState(false);
  const [plan, setPlan] = useState<Plan>(DEFAULT_PLAN);
  const [currentDay, setCurrentDay] = useState(0);
  const [setStates, setSetStates] = useState<SetStates>({});
  const [weights, setWeights] = useState<Weights>({});
  const [streak, setStreak] = useState<StreakData>({ streak: 0, lastWeek: null, total: 0 });
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [presets, setPresets] = useState<Record<string, Plan>>({});
  const [restTime, setRestTimeState] = useState(90);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const startRef = useRef<number | null>(null);

  // Hydrate state
  useEffect(() => {
    const p = readJSON<Plan>(STORAGE_KEYS.PLAN, DEFAULT_PLAN);
    setPlan(p);

    const ss: SetStates = {};
    const ws: Weights = {};
    p.forEach((day, di) => {
      day.exercises.forEach((ex, ei) => {
        ss[setKey(di, ei)] = readJSON<boolean[]>(setKey(di, ei), new Array(ex.sets).fill(false));
        const w = readString(weightKey(di, ei));
        if (w) ws[weightKey(di, ei)] = w;
      });
    });
    setSetStates(ss);
    setWeights(ws);

    setStreak(readJSON<StreakData>(STORAGE_KEYS.STREAK, { streak: 0, lastWeek: null, total: 0 }));
    setHistory(readJSON<WorkoutHistoryEntry[]>(STORAGE_KEYS.HISTORY, []));
    setPresets(readJSON<Record<string, Plan>>(STORAGE_KEYS.PRESETS, {}));
    const rt = parseInt(readString(STORAGE_KEYS.REST_TIME) || "90", 10);
    if (!Number.isNaN(rt)) setRestTimeState(rt);

    let start = parseInt(readString(STORAGE_KEYS.WORKOUT_START) || "", 10);
    if (Number.isNaN(start) || !start) {
      start = Date.now();
      writeString(STORAGE_KEYS.WORKOUT_START, String(start));
    }
    startRef.current = start;
    setWorkoutSeconds(Math.floor((Date.now() - start) / 1000));

    setHydrated(true);
  }, []);

  // Workout timer tick
  useEffect(() => {
    if (!hydrated) return;
    const id = setInterval(() => {
      if (startRef.current) {
        setWorkoutSeconds(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [hydrated]);

  const persistPlan = useCallback((next: Plan) => {
    writeJSON(STORAGE_KEYS.PLAN, next);
  }, []);

  const setRestTime = useCallback((n: number) => {
    setRestTimeState(n);
    writeString(STORAGE_KEYS.REST_TIME, String(n));
  }, []);

  const setSetState = useCallback((di: number, ei: number, idx: number, value: boolean) => {
    setSetStates((prev) => {
      const k = setKey(di, ei);
      const ex = plan[di]?.exercises[ei];
      const cur = prev[k] ?? new Array(ex?.sets ?? 0).fill(false);
      const next = [...cur];
      next[idx] = value;
      writeJSON(k, next);
      return { ...prev, [k]: next };
    });
  }, [plan]);

  const toggleSet = useCallback((di: number, ei: number) => {
    setSetStates((prev) => {
      const k = setKey(di, ei);
      const ex = plan[di]?.exercises[ei];
      const cur = prev[k] ?? new Array(ex?.sets ?? 0).fill(false);
      const nextIdx = cur.findIndex((v) => !v);
      if (nextIdx === -1) return prev;
      const next = [...cur];
      next[nextIdx] = true;
      writeJSON(k, next);
      return { ...prev, [k]: next };
    });
  }, [plan]);

  const undoLastSet = useCallback((di: number, ei: number) => {
    setSetStates((prev) => {
      const k = setKey(di, ei);
      const cur = prev[k] ?? [];
      const next = [...cur];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i]) {
          next[i] = false;
          break;
        }
      }
      writeJSON(k, next);
      return { ...prev, [k]: next };
    });
  }, []);

  const setWeight = useCallback((di: number, ei: number, value: string) => {
    const k = weightKey(di, ei);
    setWeights((prev) => ({ ...prev, [k]: value }));
    writeString(k, value);
  }, []);

  const addDay = useCallback((name: string, short: string) => {
    if (plan.length >= 7) {
      toast("Максимум 7 дней");
      return;
    }
    const next: Plan = [
      ...plan,
      {
        name: name.toUpperCase(),
        short,
        exercises: [{ name: "Новое упражнение", sets: 3, target: "10" }],
      },
    ];
    setPlan(next);
    persistPlan(next);
    setCurrentDay(next.length - 1);
  }, [plan, persistPlan, toast]);

  const deleteDay = useCallback((di: number) => {
    if (plan.length <= 1) {
      toast("Минимум 1 день");
      return;
    }
    const next = plan.filter((_, i) => i !== di);
    setPlan(next);
    persistPlan(next);
    if (currentDay >= next.length) setCurrentDay(next.length - 1);
  }, [plan, persistPlan, currentDay, toast]);

  const saveDayEdit = useCallback((di: number, day: Plan[number]) => {
    const next = plan.map((d, i) => (i === di ? day : d));
    setPlan(next);
    persistPlan(next);
    // Reset set states size if needed
    setSetStates((prev) => {
      const updated: SetStates = { ...prev };
      day.exercises.forEach((ex, ei) => {
        const k = setKey(di, ei);
        const cur = updated[k] ?? [];
        const sized = new Array(ex.sets).fill(false).map((_, i) => cur[i] ?? false);
        updated[k] = sized;
        writeJSON(k, sized);
      });
      return updated;
    });
  }, [plan, persistPlan]);

  const resetDay = useCallback(() => {
    plan[currentDay]?.exercises.forEach((_, ei) => {
      const k = setKey(currentDay, ei);
      removeKey(k);
    });
    setSetStates((prev) => {
      const next = { ...prev };
      plan[currentDay]?.exercises.forEach((ex, ei) => {
        next[setKey(currentDay, ei)] = new Array(ex.sets).fill(false);
      });
      return next;
    });
    removeKey(STORAGE_KEYS.WORKOUT_START);
    const start = Date.now();
    writeString(STORAGE_KEYS.WORKOUT_START, String(start));
    startRef.current = start;
    setWorkoutSeconds(0);
  }, [plan, currentDay]);

  const completeDay = useCallback(() => {
    const today = getWeekId(new Date());
    if (streak.lastWeek === today) {
      toast("На этой неделе уже отмечал! 🔥");
      return;
    }
    const prevWeek = new Date();
    prevWeek.setDate(prevWeek.getDate() - 7);
    const lastWeekId = getWeekId(prevWeek);

    const newStreak: StreakData = {
      streak: streak.lastWeek === lastWeekId ? streak.streak + 1 : 1,
      lastWeek: today,
      total: (streak.total || 0) + 1,
    };
    setStreak(newStreak);
    writeJSON(STORAGE_KEYS.STREAK, newStreak);

    const start = startRef.current;
    let duration = 0;
    if (start) {
      duration = Date.now() - start;
      removeKey(STORAGE_KEYS.WORKOUT_START);
      const newStart = Date.now();
      writeString(STORAGE_KEYS.WORKOUT_START, String(newStart));
      startRef.current = newStart;
      setWorkoutSeconds(0);
    }

    const day = plan[currentDay];
    if (!day) return;
    const exercises = day.exercises.map((ex, ei) => {
      const state = setStates[setKey(currentDay, ei)] ?? [];
      return {
        name: ex.name,
        sets: ex.sets,
        done: state.filter(Boolean).length,
        weight: weights[weightKey(currentDay, ei)] || "",
      };
    });

    const entry: WorkoutHistoryEntry = {
      date: today,
      dayName: day.name,
      short: day.short,
      duration,
      exercises,
    };
    const nextHistory = [entry, ...history].slice(0, 100);
    setHistory(nextHistory);
    writeJSON(STORAGE_KEYS.HISTORY, nextHistory);

    toast(
      `День засчитан! Стрик: ${newStreak.streak} нед.${duration ? ` · ⏱ ${formatDuration(duration)}` : ""}`,
      4000,
    );
    playBeep();
    vibrate([100, 50, 100]);
  }, [streak, plan, currentDay, setStates, weights, history, toast]);

  const savePreset = useCallback((name: string) => {
    const next = { ...presets, [name]: JSON.parse(JSON.stringify(plan)) as Plan };
    setPresets(next);
    writeJSON(STORAGE_KEYS.PRESETS, next);
    toast(`Пресет «${name}» сохранён!`);
  }, [presets, plan, toast]);

  const loadPreset = useCallback((name: string) => {
    const p = presets[name];
    if (!p) return;
    const cloned: Plan = JSON.parse(JSON.stringify(p));
    setPlan(cloned);
    persistPlan(cloned);
    setCurrentDay(0);
    // refresh set states sizes
    setSetStates(() => {
      const ss: SetStates = {};
      cloned.forEach((day, di) => {
        day.exercises.forEach((ex, ei) => {
          const k = setKey(di, ei);
          ss[k] = readJSON<boolean[]>(k, new Array(ex.sets).fill(false));
        });
      });
      return ss;
    });
    toast(`Загружено: «${name}»`);
  }, [presets, persistPlan, toast]);

  const deletePreset = useCallback((name: string) => {
    const next = { ...presets };
    delete next[name];
    setPresets(next);
    writeJSON(STORAGE_KEYS.PRESETS, next);
  }, [presets]);

  const value = useMemo<Ctx>(() => ({
    hydrated,
    plan,
    currentDay,
    setCurrentDay,
    setStates,
    weights,
    streak,
    workoutSeconds,
    history,
    presets,
    restTime,
    setRestTime,
    toggleSet,
    setSetState,
    undoLastSet,
    setWeight,
    addDay,
    deleteDay,
    saveDayEdit,
    resetDay,
    completeDay,
    savePreset,
    loadPreset,
    deletePreset,
  }), [
    hydrated, plan, currentDay, setStates, weights, streak, workoutSeconds, history,
    presets, restTime, setRestTime, toggleSet, setSetState, undoLastSet, setWeight,
    addDay, deleteDay, saveDayEdit, resetDay, completeDay, savePreset, loadPreset, deletePreset,
  ]);

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}
