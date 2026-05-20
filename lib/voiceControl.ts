"use client";

import { useEffect, useRef } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SRGlobal = typeof window & {
  SpeechRecognition?: { new (): SpeechRecognitionLike };
  webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
};

// Phrases that trigger "finish current set"
const TRIGGER_WORDS_RU = ["готово", "готов", "сделал", "следующий", "стоп", "хватит"];
const TRIGGER_WORDS_EN = ["done", "finish", "next", "stop", "complete", "ready"];

export function matchesTrigger(transcript: string): boolean {
  const t = transcript.toLowerCase().trim();
  if (!t) return false;
  return [...TRIGGER_WORDS_RU, ...TRIGGER_WORDS_EN].some((w) => t.includes(w));
}

/**
 * Listens for "done" voice commands while `active` is true.
 * Calls onTrigger when a trigger phrase is detected.
 */
export function useVoiceControl(active: boolean, onTrigger: () => void) {
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const triggerRef = useRef(onTrigger);

  useEffect(() => {
    triggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as SRGlobal;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return;

    if (!active) {
      if (recRef.current) {
        try {
          recRef.current.abort();
        } catch {
          /* noop */
        }
        recRef.current = null;
      }
      return;
    }

    let stopped = false;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language?.startsWith("ru") ? "ru-RU" : "en-US";

    rec.onresult = (e) => {
      const results = e.results as unknown as Array<Array<{ transcript: string }>>;
      // Look at the latest result
      const last = results[results.length - 1];
      if (!last || !last[0]) return;
      const text = last[0].transcript;
      if (matchesTrigger(text)) {
        triggerRef.current();
      }
    };

    rec.onerror = () => {
      // Some browsers throw when no speech is detected; auto-restart
    };

    rec.onend = () => {
      // Restart if still active
      if (!stopped && recRef.current === rec) {
        try {
          rec.start();
        } catch {
          /* noop */
        }
      }
    };

    try {
      rec.start();
      recRef.current = rec;
    } catch {
      /* noop */
    }

    return () => {
      stopped = true;
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      if (recRef.current === rec) recRef.current = null;
    };
  }, [active]);
}
