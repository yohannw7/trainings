"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { rpeKey, setKey } from "@/lib/defaults";
import { formatTime, playBeep, vibrate } from "@/lib/utils";
import { useWakeLock } from "@/lib/wakeLock";
import { useWorkout } from "./WorkoutContext";
import { useLocale } from "./LocaleProvider";

type Props = {
  open: boolean;
  di: number | null;
  ei: number | null;
  onClose: () => void;
};

export function ExerciseDrawer({ open, di, ei, onClose }: Props) {
  const { plan, setStates, restTime, setRestTime, toggleSet, undoLastSet, rpes, rpeEnabled, setRpe } =
    useWorkout();
  const { t } = useLocale();
  const [approachElapsed, setApproachElapsed] = useState(0);
  const [approachRunning, setApproachRunning] = useState(false);
  const [approachResult, setApproachResult] = useState<number | null>(null);
  const [restRemaining, setRestRemaining] = useState(0);
  const [resting, setResting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingRpeIdx, setPendingRpeIdx] = useState<number | null>(null);
  const approachStartRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ex = di !== null && ei !== null ? plan[di]?.exercises[ei] : null;
  const state = di !== null && ei !== null ? setStates[setKey(di, ei)] ?? [] : [];
  const doneCount = state.filter(Boolean).length;
  const allDone = ex ? doneCount >= ex.sets : false;

  // Keep screen awake while drawer is open and there's any active timer/countdown
  useWakeLock(open && (approachRunning || resting || countdown !== null));

  useEffect(() => {
    // Reset transient state when changing exercise or closing
    setApproachElapsed(0);
    setApproachRunning(false);
    setApproachResult(null);
    setRestRemaining(0);
    setResting(false);
    setCountdown(null);
    setPendingRpeIdx(null);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [di, ei, open]);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (restRef.current) clearInterval(restRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const beginApproachTimer = () => {
    if (!ex) return;
    setApproachResult(null);
    setApproachElapsed(0);
    setApproachRunning(true);
    approachStartRef.current = Date.now();
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (approachStartRef.current) {
        setApproachElapsed(Math.floor((Date.now() - approachStartRef.current) / 1000));
      }
    }, 100);
    playBeep();
    vibrate(120);
  };

  const startApproach = () => {
    if (resting || !ex || countdown !== null || approachRunning) return;
    // 3-2-1 countdown
    setCountdown(3);
    playBeep();
    vibrate(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          beginApproachTimer();
          return null;
        }
        playBeep();
        vibrate(60);
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  };

  const finishApproach = () => {
    if (!approachRunning || di === null || ei === null) return;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setApproachRunning(false);
    setApproachResult(approachElapsed);
    toggleSet(di, ei);

    const newDone = doneCount + 1;
    const justFinishedIdx = newDone - 1;
    const moreToGo = ex && newDone < ex.sets;

    if (rpeEnabled) {
      // Ask for RPE first; rest will start once the user answers (or skips)
      setPendingRpeIdx(justFinishedIdx);
    } else if (moreToGo) {
      startRest();
    }
  };

  const handleRpe = (value: number | null) => {
    if (di === null || ei === null || pendingRpeIdx === null) return;
    setRpe(di, ei, pendingRpeIdx, value);
    setPendingRpeIdx(null);
    // Start the rest timer after RPE selection (only if more sets are pending)
    const updatedState = setStates[setKey(di, ei)] ?? [];
    const updatedDone = updatedState.filter(Boolean).length;
    if (ex && updatedDone < ex.sets) {
      startRest();
    }
  };

  const startRest = () => {
    setResting(true);
    setRestRemaining(restTime);
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          if (restRef.current) {
            clearInterval(restRef.current);
            restRef.current = null;
          }
          setResting(false);
          playBeep();
          vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelRest = () => {
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
    setResting(false);
    setRestRemaining(0);
  };

  const handleUndo = () => {
    if (di === null || ei === null) return;
    undoLastSet(di, ei);
    cancelRest();
    cancelCountdown();
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setApproachRunning(false);
    setApproachResult(null);
    setApproachElapsed(0);
  };

  return (
    <AnimatePresence>
      {open && ex && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm sm:flex sm:items-center sm:justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: "100%", opacity: 1, scale: 1 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[92vh] flex-col rounded-t-3xl border-t border-border/60 bg-bg p-5 shadow-soft sm:relative sm:inset-auto sm:bottom-auto sm:m-auto sm:max-h-[88vh] sm:w-full sm:max-w-md sm:rounded-3xl sm:border sm:p-6 sm:shadow-glow"
              data-lenis-prevent
            >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />

            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h3 className="heading-display text-2xl font-bold leading-tight">{ex.name}</h3>
                <p className="mt-1 text-sm text-muted">
                  {t("drawer.target", { target: ex.target, done: doneCount, total: ex.sets })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 text-muted transition-colors hover:border-danger/50 hover:text-danger"
                aria-label={t("common.close")}
              >
                ✕
              </button>
            </div>

            {/* Set dots */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: ex.sets }).map((_, i) => {
                const exRpes = di !== null && ei !== null ? rpes[rpeKey(di, ei)] ?? [] : [];
                const rpe = exRpes[i];
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-medium transition-all ${
                        state[i]
                          ? "border-accent/40 bg-accent-gradient text-white shadow-glow"
                          : "border-border/60 bg-surface/40 text-muted"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {rpeEnabled && (
                      <span
                        className={`h-3.5 text-[10px] font-mono ${
                          typeof rpe === "number" ? "text-accent2" : "text-muted/40"
                        }`}
                      >
                        {typeof rpe === "number" ? rpe : "·"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {doneCount > 0 && (
              <button
                onClick={handleUndo}
                className="mt-3 self-start rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                {t("drawer.undoLast")}
              </button>
            )}

            {/* Stopwatch / result */}
            <div className="mt-4 min-h-[80px]">
              <AnimatePresence mode="wait">
                {countdown !== null && (
                  <motion.div
                    key="countdown"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 text-center"
                  >
                    <button
                      onClick={cancelCountdown}
                      className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-danger"
                      aria-label={t("common.cancel")}
                    >
                      ✕
                    </button>
                    <div className="text-xs uppercase tracking-wider text-muted">
                      {t("drawer.getReady")}
                    </div>
                    <div className="relative mt-1 flex h-20 items-center justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={countdown}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.6 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="heading-display absolute bg-accent-gradient bg-clip-text text-7xl font-bold leading-none text-transparent tabular-nums"
                        >
                          {countdown}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
                {countdown === null && approachRunning && (
                  <motion.div
                    key="running"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-border/60 bg-surface/40 px-5 py-4 text-center"
                  >
                    <div className="heading-display text-5xl font-bold tabular-nums">
                      {formatTime(approachElapsed)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                      {t("drawer.setTime")}
                    </div>
                  </motion.div>
                )}
                {countdown === null && !approachRunning && approachResult !== null && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", damping: 20, stiffness: 280 }}
                    className="flex justify-center"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success">
                      ⏱ {formatTime(approachResult)}
                    </span>
                  </motion.div>
                )}
                {countdown === null && resting && (
                  <motion.div
                    key="rest"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-center"
                  >
                    <button
                      onClick={cancelRest}
                      className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-danger"
                    >
                      ✕
                    </button>
                    <div className="text-xs uppercase tracking-wider text-muted">{t("drawer.rest")}</div>
                    <div className="heading-display mt-1 text-4xl font-bold tabular-nums text-accent2">
                      {formatTime(restRemaining)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RPE prompt */}
            <AnimatePresence>
              {pendingRpeIdx !== null && (
                <motion.div
                  key="rpe"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-4"
                >
                  <p className="mb-1 text-center text-sm font-medium text-text">
                    {t("drawer.rpeQuestion")}
                  </p>
                  <p className="mb-3 text-center text-[11px] text-muted">{t("drawer.rpeHint")}</p>
                  <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const value = i + 1;
                      const tone =
                        value <= 5
                          ? "border-success/30 hover:bg-success/15"
                          : value <= 7
                            ? "border-accent/30 hover:bg-accent/15"
                            : "border-danger/30 hover:bg-danger/15";
                      return (
                        <button
                          key={value}
                          onClick={() => handleRpe(value)}
                          className={`heading-display rounded-lg border bg-surface/50 py-2 text-base font-bold transition-colors ${tone}`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleRpe(null)}
                    className="mx-auto mt-2 block text-xs text-muted hover:text-text"
                  >
                    {t("drawer.rpeSkip")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rest setup */}
            {!allDone && !resting && pendingRpeIdx === null && (
              <div className="mt-4 rounded-2xl border border-border/60 bg-surface/30 p-4">
                <span className="label">{t("drawer.restSetup")}</span>
                <input
                  type="number"
                  className="input mt-1 max-w-[140px]"
                  value={restTime}
                  min={5}
                  max={600}
                  step={5}
                  onChange={(e) => setRestTime(parseInt(e.target.value) || 90)}
                />
              </div>
            )}

            {/* Action buttons */}
            {pendingRpeIdx === null && (
              <div className="mt-5">
                {allDone ? (
                  <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-4 text-center text-sm font-medium text-success">
                    {t("drawer.allDone")}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={startApproach}
                      disabled={approachRunning || resting || countdown !== null}
                      className="btn btn-primary flex-1"
                    >
                      {countdown !== null
                        ? t("drawer.startCountdown", { n: countdown })
                        : t("drawer.startApproach")}
                    </button>
                    <button
                      onClick={finishApproach}
                      disabled={!approachRunning}
                      className="btn btn-success flex-1"
                    >
                      {t("drawer.finish")}
                    </button>
                  </div>
                )}
              </div>
            )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
