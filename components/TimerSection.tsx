"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatStopwatch, formatTime, playBeep, vibrate } from "@/lib/utils";

const PRESETS = [30, 60, 120, 180, 240, 300, 600];

type Mode = "timer" | "sw";

export function TimerSection() {
  const [mode, setMode] = useState<Mode>("timer");

  return (
    <section id="timer" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent2">
          02 — Время
        </span>
        <h2 className="heading-display mt-2 text-3xl font-bold sm:text-4xl">
          Таймер и секундомер
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Контролируй интервалы отдыха и точно измеряй любые активности.
        </p>
      </div>

      <div className="card overflow-hidden p-5 sm:p-7">
        <div className="mb-5 inline-flex rounded-full border border-border/60 bg-surface/40 p-1">
          <ModeButton active={mode === "timer"} onClick={() => setMode("timer")}>
            ⏲ Таймер
          </ModeButton>
          <ModeButton active={mode === "sw"} onClick={() => setMode("sw")}>
            ⏱ Секундомер
          </ModeButton>
        </div>

        {mode === "timer" ? <Timer /> : <Stopwatch />}
      </div>
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "text-white" : "text-muted hover:text-text"
      }`}
    >
      {active && (
        <motion.span
          layoutId="mode-indicator"
          className="absolute inset-0 rounded-full bg-accent-gradient shadow-glow"
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function Timer() {
  const [total, setTotal] = useState(60);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const setDuration = (s: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTotal(s);
    setLeft(s);
  };

  const toggle = () => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      return;
    }
    if (left <= 0) setLeft(total);
    setRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          playBeep();
          vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setLeft(total);
  };

  const pct = total > 0 ? ((total - left) / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center">
      <ProgressRing pct={pct}>
        <div className="heading-display text-5xl font-bold tabular-nums sm:text-6xl">
          {formatTime(left)}
        </div>
        <div className="mt-1 text-xs uppercase tracking-wider text-muted">
          {running ? "Идёт" : left === 0 ? "Готово" : "Готов"}
        </div>
      </ProgressRing>

      <div className="mt-6 flex w-full max-w-xs gap-2">
        <button onClick={toggle} className="btn btn-primary flex-1">
          {running ? "Пауза" : "Старт"}
        </button>
        <button onClick={reset} className="btn flex-1">
          Сброс
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => setDuration(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              total === s
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-border/60 bg-surface/40 text-muted hover:text-text"
            }`}
          >
            {formatTime(s)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stopwatch() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Array<{ n: number; total: string; lap: string }>>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const lastLapRef = useRef<number>(0);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const toggle = () => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      return;
    }
    startRef.current = Date.now() - ms;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setMs(Date.now() - startRef.current);
    }, 30);
  };

  const lap = () => {
    if (!running && ms === 0) return;
    const lapMs = ms - lastLapRef.current;
    lastLapRef.current = ms;
    setLaps((prev) => [
      { n: prev.length + 1, total: formatStopwatch(ms), lap: formatStopwatch(lapMs) },
      ...prev,
    ]);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMs(0);
    lastLapRef.current = 0;
    setLaps([]);
  };

  const pct = (ms % 60000) / 600;

  return (
    <div className="flex flex-col items-center">
      <ProgressRing pct={pct}>
        <div className="heading-display text-4xl font-bold tabular-nums sm:text-5xl">
          {formatStopwatch(ms)}
        </div>
        <div className="mt-1 text-xs uppercase tracking-wider text-muted">Секундомер</div>
      </ProgressRing>

      <div className="mt-6 flex w-full max-w-sm gap-2">
        <button onClick={toggle} className="btn btn-primary flex-1">
          {running ? "Пауза" : ms > 0 ? "Продолжить" : "Старт"}
        </button>
        <button onClick={lap} className="btn flex-1" disabled={!running && ms === 0}>
          Круг
        </button>
        <button onClick={reset} className="btn flex-1" disabled={ms === 0}>
          Сброс
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-5 w-full max-w-md space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {laps.map((l) => (
            <div
              key={l.n}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/30 px-3 py-2 text-xs"
            >
              <span className="text-muted">Круг {l.n}</span>
              <span className="text-accent2 tabular-nums">{l.lap}</span>
              <span className="text-muted tabular-nums">{l.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressRing({ pct, children }: { pct: number; children: React.ReactNode }) {
  const SIZE = 220;
  const STROKE = 10;
  const r = (SIZE - STROKE) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--accent))" />
            <stop offset="100%" stopColor="rgb(var(--accent2))" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke="rgb(var(--border))"
          strokeOpacity={0.4}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
