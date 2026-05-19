import type { Plan, WorkoutHistoryEntry } from "./types";
import type { Locale } from "./i18n";

const T = {
  ru: {
    workout: "Тренировка",
    duration: "Длительность",
    sets: "подходов",
    weight: "вес",
    rpe: "RPE",
    appLink: "Трекер: https://yohannw7.github.io/trainings/",
  },
  en: {
    workout: "Workout",
    duration: "Duration",
    sets: "sets",
    weight: "weight",
    rpe: "RPE",
    appLink: "Tracker: https://yohannw7.github.io/trainings/",
  },
} as const;

function formatDur(ms: number, locale: Locale): string {
  if (!ms) return "";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (locale === "ru") {
    if (h > 0) return `${h}ч ${m}мин`;
    if (m > 0) return `${m}мин ${s}сек`;
    return `${s}сек`;
  }
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatHistoryEntry(entry: WorkoutHistoryEntry, locale: Locale): string {
  const t = T[locale];
  const lines: string[] = [];
  lines.push(`💪 ${t.workout} — ${entry.dayName}`);
  if (entry.duration) lines.push(`⏱ ${t.duration}: ${formatDur(entry.duration, locale)}`);
  lines.push("");
  for (const ex of entry.exercises) {
    const parts: string[] = [];
    parts.push(`${ex.done}/${ex.sets} ${t.sets}`);
    if (ex.weight) parts.push(`${ex.weight} ${locale === "ru" ? "кг" : "kg"}`);
    if (typeof ex.avgRpe === "number") parts.push(`${t.rpe} ${ex.avgRpe}`);
    lines.push(`• ${ex.name} — ${parts.join(" · ")}`);
  }
  lines.push("");
  lines.push(t.appLink);
  return lines.join("\n");
}

export function formatPlan(plan: Plan, locale: Locale): string {
  const t = T[locale];
  const lines: string[] = [];
  lines.push(locale === "ru" ? "📋 План тренировок" : "📋 Workout plan");
  lines.push("");
  plan.forEach((day, i) => {
    lines.push(`${i + 1}. ${day.name}`);
    day.exercises.forEach((ex) => {
      lines.push(`   • ${ex.name} — ${ex.sets} × ${ex.target}`);
    });
    lines.push("");
  });
  lines.push(t.appLink);
  return lines.join("\n");
}

/** Tries Web Share API first, falls back to clipboard. Returns true on success. */
export async function shareOrCopy(text: string, title?: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator === "undefined") return "failed";

  // Web Share API on mobile shows the native share sheet
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (err: unknown) {
      // User cancelled — pretend it succeeded so we don't error-toast
      if ((err as { name?: string })?.name === "AbortError") return "shared";
      // fall through to clipboard
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      /* noop */
    }
  }

  // Last-resort fallback for older browsers
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return "copied";
  } catch {
    return "failed";
  }
}
