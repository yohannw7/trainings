"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MUSCLE_LABELS, searchExercises, type LibraryExercise } from "@/lib/exerciseLibrary";
import { useLocale } from "./LocaleProvider";

type Picked = { name: string; sets: number; target: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick: (picked: Picked) => void;
  placeholder?: string;
};

export function ExerciseAutocomplete({ value, onChange, onPick, placeholder }: Props) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = searchExercises(value, locale);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Reset highlight when matches change
  useEffect(() => {
    setHighlight(0);
  }, [value]);

  const choose = (item: LibraryExercise) => {
    onPick({
      name: locale === "ru" ? item.nameRu : item.name,
      sets: item.defaultSets,
      target: item.defaultTarget,
    });
    setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(matches.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        className="input"
        placeholder={placeholder ?? t("editor.exName")}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (value.trim()) setOpen(true);
        }}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-border/60 bg-bg p-1 shadow-soft"
            data-lenis-prevent
          >
            {matches.map((m, idx) => (
              <button
                key={m.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(m)}
                onMouseEnter={() => setHighlight(idx)}
                className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                  idx === highlight ? "bg-surface" : "hover:bg-surface/60"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-text">
                    {locale === "ru" ? m.nameRu : m.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    {m.muscles.slice(0, 3).map((mus) => (
                      <span
                        key={mus}
                        className="rounded-full border border-border/40 bg-surface/40 px-1.5 py-0.5 text-[10px] text-muted"
                      >
                        {MUSCLE_LABELS[mus][locale]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right text-[10px] text-muted">
                  <div>
                    {m.defaultSets} × {m.defaultTarget}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
