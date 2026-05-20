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
import { DEFAULT_PLAN, STORAGE_KEYS, rpeKey, setKey, weightKey } from "@/lib/defaults";
import { readJSON, readString, removeKey, writeJSON, writeString } from "@/lib/storage";
import type { Plan, PersonalRecords, StreakData, WorkoutHistoryEntry } from "@/lib/types";
import { getWeekId, playBeep, vibrate } from "@/lib/utils";
import { formatDurationLocalized } from "@/lib/i18n";
import { useToast } from "./ToastProvider";
import { useLocale } from "./LocaleProvider";

type SetStates = Record<string, boolean[]>;
type Weights = Record<string, string>;
type Rpes = Record<string, Array<number | null>>;

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
  prs: PersonalRecords;
  rpes: Rpes;
  rpeEnabled: boolean;

  setRestTime: (n: number) => void;
  setRpeEnabled: (enabled: boolean) => void;
  setRpe: (di: number, ei: number, idx: number, value: number | null) => void;
  toggleSet: (di: number, ei: number) => void;
  setSetState: (di: number, ei: number, idx: number, value: boolean) => void;
  undoLastSet: (di: number, ei: number) => void;
  setWeight: (di: number, ei: number, value: string) => void;

  addDay: (name: string, short: string) => void;
  deleteDay: (di: number) => void;
  saveDayEdit: (di: number, day: Plan[number]) => void;
  reorderExercises: (di: number, exercises: Plan[number]["exercises"]) => void;
  resetDay: () => void;
  completeDay: () => void;

  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
  loadProgram: (plan: Plan) => void;

  isPR: (exerciseName: string, weight: number) => boolean;
  getLastWeight: (exerciseName: string) => string | null;
  getWeightSuggestion: (exerciseName: string) => number | null;
};

const WorkoutContext = createContext<Ctx | null>(null);

let _idCounter = 0;
function genId(): string {
  _idCounter += 1;
  return `ex_${Date.now().toString(36)}_${_idCounter}`;
}

/**
 * Returns a plan where every exercise has a stable `_id`. If all already have one,
 * the original reference is returned so React effects don't re-run unnecessarily.
 */
function ensureExerciseIds(plan: Plan): Plan {
  let touched = false;
  const next = plan.map((day) => {
    let dayTouched = false;
    const exs = day.exercises.map((ex) => {
      if (ex._id) return ex;
      dayTouched = true;
      return { ...ex, _id: genId() };
    });
    if (!dayTouched) return day;
    touched = true;
    return { ...day, exercises: exs };
  });
  return touched ? next : plan;
}

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { t, locale } = useLocale();
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
  const [prs, setPrs] = useState<PersonalRecords>({});
  const [rpes, setRpes] = useState<Rpes>({});
  const [rpeEnabled, setRpeEnabledState] = useState(false);
  const startRef = useRef<number | null>(null);

  // Hydrate state
  useEffect(() => {
    const raw = readJSON<Plan>(STORAGE_KEYS.PLAN, DEFAULT_PLAN);
    const p = ensureExerciseIds(raw);
    setPlan(p);
    // Persist back if we just assigned ids
    if (p !== raw) writeJSON(STORAGE_KEYS.PLAN, p);

    const ss: SetStates = {};
    const ws: Weights = {};
    const rp: Rpes = {};
    p.forEach((day, di) => {
      day.exercises.forEach((ex, ei) => {
        ss[setKey(di, ei)] = readJSON<boolean[]>(setKey(di, ei), new Array(ex.sets).fill(false));
        const w = readString(weightKey(di, ei));
        if (w) ws[weightKey(di, ei)] = w;
        rp[rpeKey(di, ei)] = readJSON<Array<number | null>>(
          rpeKey(di, ei),
          new Array(ex.sets).fill(null),
        );
      });
    });
    setSetStates(ss);
    setWeights(ws);
    setRpes(rp);

    setStreak(readJSON<StreakData>(STORAGE_KEYS.STREAK, { streak: 0, lastWeek: null, total: 0 }));
    setHistory(readJSON<WorkoutHistoryEntry[]>(STORAGE_KEYS.HISTORY, []));
    setPresets(readJSON<Record<string, Plan>>(STORAGE_KEYS.PRESETS, {}));
    setPrs(readJSON<PersonalRecords>(STORAGE_KEYS.PRS, {}));
    setRpeEnabledState(readJSON<boolean>(STORAGE_KEYS.RPE_ENABLED, false));

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

  const setRpeEnabled = useCallback((enabled: boolean) => {
    setRpeEnabledState(enabled);
    writeJSON(STORAGE_KEYS.RPE_ENABLED, enabled);
  }, []);

  const setRpe = useCallback(
    (di: number, ei: number, idx: number, value: number | null) => {
      setRpes((prev) => {
        const k = rpeKey(di, ei);
        const ex = plan[di]?.exercises[ei];
        const cur = prev[k] ?? new Array(ex?.sets ?? 0).fill(null);
        const next = [...cur];
        next[idx] = value;
        writeJSON(k, next);
        return { ...prev, [k]: next };
      });
    },
    [plan],
  );

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
      // Increment lifetime sets counter
      setStreak((s) => {
        const updated = { ...s, lifetimeSets: (s.lifetimeSets ?? 0) + 1 };
        writeJSON(STORAGE_KEYS.STREAK, updated);
        return updated;
      });
      return { ...prev, [k]: next };
    });
  }, [plan]);

  const undoLastSet = useCallback((di: number, ei: number) => {
    setSetStates((prev) => {
      const k = setKey(di, ei);
      const cur = prev[k] ?? [];
      // Find last completed set
      let removedIdx = -1;
      for (let i = cur.length - 1; i >= 0; i--) {
        if (cur[i]) {
          removedIdx = i;
          break;
        }
      }
      if (removedIdx === -1) return prev;
      const next = [...cur];
      next[removedIdx] = false;
      writeJSON(k, next);
      // Decrement lifetime counter (clamp to 0)
      setStreak((s) => {
        const updated = { ...s, lifetimeSets: Math.max(0, (s.lifetimeSets ?? 0) - 1) };
        writeJSON(STORAGE_KEYS.STREAK, updated);
        return updated;
      });
      // Clear matching RPE
      setRpes((prevRpes) => {
        const rk = rpeKey(di, ei);
        const curRpes = prevRpes[rk] ?? [];
        if (curRpes[removedIdx] == null) return prevRpes;
        const nextRpes = [...curRpes];
        nextRpes[removedIdx] = null;
        writeJSON(rk, nextRpes);
        return { ...prevRpes, [rk]: nextRpes };
      });
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
      toast(t("training.maxDays"));
      return;
    }
    const next: Plan = ensureExerciseIds([
      ...plan,
      {
        name: name.toUpperCase(),
        short,
        exercises: [{ name: "Новое упражнение", sets: 3, target: "10" }],
      },
    ]);
    setPlan(next);
    persistPlan(next);
    setCurrentDay(next.length - 1);
  }, [plan, persistPlan, toast, t]);

  const deleteDay = useCallback((di: number) => {
    if (plan.length <= 1) {
      toast(t("training.minDays"));
      return;
    }
    const next = plan.filter((_, i) => i !== di);
    setPlan(next);
    persistPlan(next);
    if (currentDay >= next.length) setCurrentDay(next.length - 1);
  }, [plan, persistPlan, currentDay, toast, t]);

  const saveDayEdit = useCallback((di: number, day: Plan[number]) => {
    const next = ensureExerciseIds(plan.map((d, i) => (i === di ? day : d)));
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

  const reorderExercises = useCallback((di: number, exercises: Plan[number]["exercises"]) => {
    const day = plan[di];
    if (!day) return;

    // Match new order back to original positions by stable _id, then by reference, then by name.
    const oldIndices = exercises.map((ex) => {
      if (ex._id) {
        const byId = day.exercises.findIndex((o) => o._id === ex._id);
        if (byId !== -1) return byId;
      }
      const byRef = day.exercises.findIndex((o) => o === ex);
      if (byRef !== -1) return byRef;
      return day.exercises.findIndex((o) => o.name === ex.name);
    });

    // Snapshot previous set states, weights, and RPE
    const prevStates: Array<boolean[]> = [];
    const prevWeights: Array<string> = [];
    const prevRpes: Array<Array<number | null>> = [];
    day.exercises.forEach((ex, ei) => {
      prevStates[ei] = setStates[setKey(di, ei)] ?? new Array(ex.sets).fill(false);
      prevWeights[ei] = weights[weightKey(di, ei)] ?? readString(weightKey(di, ei)) ?? "";
      prevRpes[ei] = rpes[rpeKey(di, ei)] ?? new Array(ex.sets).fill(null);
    });

    // Apply reorder
    const next = plan.map((d, i) => (i === di ? { ...d, exercises } : d));
    setPlan(next);
    persistPlan(next);

    // Re-map keys to new positions
    setSetStates((prev) => {
      const updated: SetStates = { ...prev };
      exercises.forEach((_, newIdx) => {
        const oldIdx = oldIndices[newIdx];
        const k = setKey(di, newIdx);
        const value = oldIdx !== -1 ? prevStates[oldIdx] ?? [] : [];
        updated[k] = value;
        writeJSON(k, value);
      });
      return updated;
    });
    setWeights((prev) => {
      const updated: Weights = { ...prev };
      exercises.forEach((_, newIdx) => {
        const oldIdx = oldIndices[newIdx];
        const k = weightKey(di, newIdx);
        const value = oldIdx !== -1 ? prevWeights[oldIdx] ?? "" : "";
        updated[k] = value;
        if (value) writeString(k, value);
        else removeKey(k);
      });
      return updated;
    });
    setRpes((prev) => {
      const updated: Rpes = { ...prev };
      exercises.forEach((_, newIdx) => {
        const oldIdx = oldIndices[newIdx];
        const k = rpeKey(di, newIdx);
        const value = oldIdx !== -1 ? prevRpes[oldIdx] ?? [] : [];
        updated[k] = value;
        writeJSON(k, value);
      });
      return updated;
    });
  }, [plan, persistPlan, setStates, weights, rpes]);

  const resetDay = useCallback(() => {
    plan[currentDay]?.exercises.forEach((_, ei) => {
      removeKey(setKey(currentDay, ei));
      removeKey(rpeKey(currentDay, ei));
    });
    setSetStates((prev) => {
      const next = { ...prev };
      plan[currentDay]?.exercises.forEach((ex, ei) => {
        next[setKey(currentDay, ei)] = new Array(ex.sets).fill(false);
      });
      return next;
    });
    setRpes((prev) => {
      const next = { ...prev };
      plan[currentDay]?.exercises.forEach((ex, ei) => {
        next[rpeKey(currentDay, ei)] = new Array(ex.sets).fill(null);
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
      toast(t("toast.alreadyMarked"));
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
      const rpeArr = rpes[rpeKey(currentDay, ei)] ?? [];
      const rpeNumbers = rpeArr.filter(
        (v): v is number => typeof v === "number" && !Number.isNaN(v),
      );
      const avgRpe =
        rpeNumbers.length > 0
          ? Math.round((rpeNumbers.reduce((a, b) => a + b, 0) / rpeNumbers.length) * 10) / 10
          : null;
      return {
        name: ex.name,
        sets: ex.sets,
        done: state.filter(Boolean).length,
        weight: weights[weightKey(currentDay, ei)] || "",
        avgRpe,
      };
    });

    // Update PRs (for exercises that had at least one set done with weight > current PR)
    const updatedPrs: PersonalRecords = { ...prs };
    let newPrCount = 0;
    exercises.forEach((ex) => {
      if (ex.done === 0) return;
      const w = parseFloat(ex.weight);
      if (!w || Number.isNaN(w)) return;
      const cur = updatedPrs[ex.name];
      if (!cur || w > cur.weight) {
        updatedPrs[ex.name] = { weight: w, date: today };
        newPrCount += 1;
      }
    });
    if (newPrCount > 0) {
      setPrs(updatedPrs);
      writeJSON(STORAGE_KEYS.PRS, updatedPrs);
    }

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

    const prMsg =
      newPrCount > 0
        ? ` · ${
            newPrCount === 1
              ? t("toast.recordSingle", { n: newPrCount })
              : t("toast.records", { n: newPrCount })
          }`
        : "";
    const durMsg = duration ? ` · ${t("toast.duration", { value: formatDurationLocalized(duration, locale) })}` : "";
    toast(t("toast.dayDone", { streak: newStreak.streak }) + durMsg + prMsg, 4000);
    playBeep();
    vibrate([100, 50, 100]);
  }, [streak, plan, currentDay, setStates, weights, history, prs, toast, t, locale]);

  const savePreset = useCallback((name: string) => {
    const next = { ...presets, [name]: JSON.parse(JSON.stringify(plan)) as Plan };
    setPresets(next);
    writeJSON(STORAGE_KEYS.PRESETS, next);
    toast(t("training.preset.saved", { name }));
  }, [presets, plan, toast, t]);

  const loadPreset = useCallback((name: string) => {
    const p = presets[name];
    if (!p) return;
    const cloned: Plan = ensureExerciseIds(JSON.parse(JSON.stringify(p)));
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
    toast(t("training.preset.loaded", { name }));
  }, [presets, persistPlan, toast, t]);

  const deletePreset = useCallback((name: string) => {
    const next = { ...presets };
    delete next[name];
    setPresets(next);
    writeJSON(STORAGE_KEYS.PRESETS, next);
  }, [presets]);

  const loadProgram = useCallback((programPlan: Plan) => {
    const cloned: Plan = ensureExerciseIds(JSON.parse(JSON.stringify(programPlan)));
    setPlan(cloned);
    persistPlan(cloned);
    setCurrentDay(0);
    setSetStates(() => {
      const ss: SetStates = {};
      cloned.forEach((day, di) => {
        day.exercises.forEach((ex, ei) => {
          const k = setKey(di, ei);
          const fresh = new Array(ex.sets).fill(false);
          ss[k] = fresh;
          writeJSON(k, fresh);
        });
      });
      return ss;
    });
  }, [persistPlan]);

  const isPR = useCallback((exerciseName: string, weight: number) => {
    if (!weight || Number.isNaN(weight)) return false;
    const cur = prs[exerciseName];
    return !cur || weight > cur.weight;
  }, [prs]);

  const getLastWeight = useCallback((exerciseName: string): string | null => {
    for (const entry of history) {
      const found = entry.exercises.find((e) => e.name === exerciseName && e.weight);
      if (found && found.weight) return found.weight;
    }
    return null;
  }, [history]);

  /**
   * Suggest a +2.5 kg progression when the last 2 logged sessions of this exercise
   * were both fully completed at the same weight, with average RPE <= 7 (or no RPE).
   * Returns the suggested NEXT weight or null.
   */
  const getWeightSuggestion = useCallback(
    (exerciseName: string): number | null => {
      const recent: typeof history[number]["exercises"][number][] = [];
      for (const entry of history) {
        const found = entry.exercises.find((e) => e.name === exerciseName && e.weight);
        if (found) recent.push(found);
        if (recent.length >= 2) break;
      }
      if (recent.length < 2) return null;

      const w0 = parseFloat(recent[0].weight);
      const w1 = parseFloat(recent[1].weight);
      if (!w0 || !w1 || w0 !== w1) return null;

      // Both sessions must be 100% completed
      const fullyDone = recent.every((e) => e.sets > 0 && e.done >= e.sets);
      if (!fullyDone) return null;

      // If RPE recorded — must average <= 7
      const rpeOk = recent.every(
        (e) => e.avgRpe == null || e.avgRpe <= 7,
      );
      if (!rpeOk) return null;

      return Math.round((w0 + 2.5) * 10) / 10;
    },
    [history],
  );

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
    prs,
    rpes,
    rpeEnabled,
    setRestTime,
    setRpeEnabled,
    setRpe,
    toggleSet,
    setSetState,
    undoLastSet,
    setWeight,
    addDay,
    deleteDay,
    saveDayEdit,
    reorderExercises,
    resetDay,
    completeDay,
    savePreset,
    loadPreset,
    deletePreset,
    loadProgram,
    isPR,
    getLastWeight,
    getWeightSuggestion,
  }), [
    hydrated, plan, currentDay, setStates, weights, streak, workoutSeconds, history,
    presets, restTime, prs, rpes, rpeEnabled, setRestTime, setRpeEnabled, setRpe,
    toggleSet, setSetState, undoLastSet, setWeight, addDay, deleteDay, saveDayEdit,
    reorderExercises, resetDay, completeDay, savePreset, loadPreset, deletePreset,
    loadProgram, isPR, getLastWeight, getWeightSuggestion,
  ]);

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}
