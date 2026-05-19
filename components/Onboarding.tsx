"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";

const STORAGE_KEY = "onboarding_done_v2";

type Step = {
  titleKey: string;
  descKey: string;
  icon: string;
  target?: string;
};

const STEPS: Step[] = [
  { titleKey: "ob.0.title", descKey: "ob.0.desc", icon: "🏋️" },
  { titleKey: "ob.1.title", descKey: "ob.1.desc", icon: "📅", target: "[data-tour='day-pills']" },
  { titleKey: "ob.2.title", descKey: "ob.2.desc", icon: "💪", target: "[data-tour='exercise-card']" },
  { titleKey: "ob.3.title", descKey: "ob.3.desc", icon: "⚖️", target: "[data-tour='weight-input']" },
  { titleKey: "ob.4.title", descKey: "ob.4.desc", icon: "✎", target: "[data-tour='edit-day']" },
  { titleKey: "ob.5.title", descKey: "ob.5.desc", icon: "⏱", target: "#timer" },
  { titleKey: "ob.6.title", descKey: "ob.6.desc", icon: "🧮", target: "#calculators" },
  { titleKey: "ob.7.title", descKey: "ob.7.desc", icon: "🔥", target: "[data-tour='complete-day']" },
  { titleKey: "ob.8.title", descKey: "ob.8.desc", icon: "💾", target: "[data-tour='presets']" },
  { titleKey: "ob.9.title", descKey: "ob.9.desc", icon: "🎨", target: "[data-tour='settings']" },
  { titleKey: "ob.10.title", descKey: "ob.10.desc", icon: "✅" },
];

const TOOLTIP_GAP = 18;
const PAD = 10;
// Spring: enough damping to avoid bounce on big jumps, fast enough to feel snappy
const SPRING = { type: "spring" as const, damping: 30, stiffness: 220, mass: 0.6 };

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [hasTarget, setHasTarget] = useState(false);
  const [tooltipSide, setTooltipSide] = useState<"below" | "above">("below");
  const [tooltipShift, setTooltipShift] = useState(0); // for arrow alignment when tooltip is clamped
  const { t } = useLocale();
  const initialised = useRef(false);

  // Motion values for spotlight rect — these animate smoothly via springs
  const sx = useSpring(0, SPRING);
  const sy = useSpring(0, SPRING);
  const sw = useSpring(0, SPRING);
  const sh = useSpring(0, SPRING);
  // Border radius slightly smaller than rectangle's smallest dimension
  const sr = useTransform([sw, sh], ([w, h]) => Math.min(16, Math.max(8, Math.min(w as number, h as number) / 4)));

  // SVG mask is driven by raw motion values with `useMotionValue` -> we use plain refs through animate
  // We need a way to render the cutout; easiest is to mirror MV into state at low frequency via a tracker.
  // Instead, we just use motion's <rect> with motion values directly via framer-motion's motion-svg.

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  // Block user-driven scroll while onboarding is open (programmatic Lenis scroll still works)
  useEffect(() => {
    if (!show) return;
    const blockWheel = (e: WheelEvent) => e.preventDefault();
    const blockTouch = (e: TouchEvent) => e.preventDefault();
    window.addEventListener("wheel", blockWheel, { passive: false });
    window.addEventListener("touchmove", blockTouch, { passive: false });
    return () => {
      window.removeEventListener("wheel", blockWheel);
      window.removeEventListener("touchmove", blockTouch);
    };
  }, [show]);

  const measureAndPlace = useCallback(
    (selector?: string) => {
      if (!selector) {
        setHasTarget(false);
        return;
      }
      const el = document.querySelector(selector);
      if (!el) {
        setHasTarget(false);
        return;
      }
      const r = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const viewW = window.innerWidth;

      // Clamp target rect to viewport so spotlight never spills off-screen
      const top = Math.max(8, r.top - PAD);
      const left = Math.max(8, r.left - PAD);
      const right = Math.min(viewW - 8, r.right + PAD);
      const bottom = Math.min(viewH - 8, r.bottom + PAD);
      const w = Math.max(20, right - left);
      const h = Math.max(20, bottom - top);

      sx.set(left);
      sy.set(top);
      sw.set(w);
      sh.set(h);
      setHasTarget(true);

      // Decide tooltip side
      const tooltipBudget = 260;
      const spaceBelow = viewH - (top + h);
      const side: "below" | "above" =
        spaceBelow >= tooltipBudget ? "below" : "above";
      setTooltipSide(side);

      // Tooltip horizontal position (we'll place tooltip via flex, but compute arrow offset)
      const targetCenterX = left + w / 2;
      const tooltipMaxWidth = Math.min(360, viewW - 32);
      const tooltipHalf = tooltipMaxWidth / 2;
      const desiredLeft = Math.max(16, Math.min(viewW - 16 - tooltipMaxWidth, targetCenterX - tooltipHalf));
      const tooltipCenter = desiredLeft + tooltipHalf;
      // Arrow offset relative to tooltip center
      setTooltipShift(targetCenterX - tooltipCenter);
    },
    [sx, sy, sw, sh],
  );

  // When target changes: immediately position spotlight on current element location,
  // then keep it pinned while we smooth-scroll into view.
  useEffect(() => {
    if (!show) return;
    const selector = STEPS[step]?.target;

    if (!selector) {
      setHasTarget(false);
      return;
    }

    const el = document.querySelector(selector);
    if (!el) {
      setHasTarget(false);
      return;
    }

    // Show spotlight immediately at current position
    measureAndPlace(selector);

    const r = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    const tooltipBudget = 260;
    const desiredTop = Math.max(64, (viewH - tooltipBudget - r.height) / 2);
    const delta = r.top - desiredTop;

    if (Math.abs(delta) < 4) return; // already in place

    let cancelled = false;
    let rafId: number | null = null;

    // Track element position during the scroll so spotlight smoothly follows
    const tick = () => {
      if (cancelled) return;
      measureAndPlace(selector);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const stopTracking = () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      // Final precise placement once scroll has settled
      measureAndPlace(selector);
    };

    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(window.scrollY + delta, {
        duration: 0.9,
        easing: (x) => 1 - Math.pow(1 - x, 3),
        onComplete: stopTracking,
      });
    } else {
      window.scrollTo({ top: window.scrollY + delta, behavior: "smooth" });
      const settle = setTimeout(stopTracking, 700);
      return () => {
        cancelled = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
        clearTimeout(settle);
      };
    }

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [step, show, measureAndPlace]);

  // Re-measure on resize / orientation change (debounced)
  useEffect(() => {
    if (!show) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => measureAndPlace(STEPS[step]?.target), 120);
    };
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, [show, step, measureAndPlace]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!show) return null;
  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[300] overflow-hidden"
        style={{ touchAction: "none" }}
      >
        {/* Overlay with smooth animated cutout */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <mask id="onboarding-mask">
              <rect width="100%" height="100%" fill="white" />
              {hasTarget && (
                <motion.rect
                  style={{ x: sx, y: sy, width: sw, height: sh, rx: sr, ry: sr }}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.78)"
            mask="url(#onboarding-mask)"
          />
        </svg>

        {/* Glow border around target */}
        {hasTarget && (
          <motion.div
            className="pointer-events-none absolute rounded-2xl ring-2 ring-accent/80 shadow-glow"
            style={{
              top: sy,
              left: sx,
              width: sw,
              height: sh,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Tooltip */}
        <TooltipPositioner
          sy={sy}
          sh={sh}
          hasTarget={hasTarget}
          side={tooltipSide}
        >
          <motion.div
            data-lenis-prevent
            key={step}
            initial={{ opacity: 0, y: tooltipSide === "below" ? 10 : -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="pointer-events-auto relative w-[min(360px,calc(100vw-32px))] rounded-3xl border border-border/60 bg-bg p-5 shadow-glow"
            style={{ touchAction: "auto" }}
          >
            {/* Arrow pointing to target */}
            {hasTarget && (
              <div
                className="absolute"
                style={{
                  left: `calc(50% + ${tooltipShift}px - 10px)`,
                  ...(tooltipSide === "below" ? { top: -10 } : { bottom: -10 }),
                }}
              >
                <svg width="20" height="10" viewBox="0 0 20 10">
                  {tooltipSide === "below" ? (
                    <path d="M10 0L20 10H0L10 0Z" fill="rgb(var(--accent))" />
                  ) : (
                    <path d="M10 10L0 0H20L10 10Z" fill="rgb(var(--accent))" />
                  )}
                </svg>
              </div>
            )}

            {/* Progress dots */}
            <div className="mb-4 flex items-center justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 bg-accent-gradient"
                      : i < step
                        ? "w-1.5 bg-accent/50"
                        : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            <div className="mb-1 text-center text-3xl">{current.icon}</div>
            <h2 className="heading-display mb-2 text-center text-xl font-bold">
              {t(current.titleKey as Parameters<typeof t>[0])}
            </h2>
            <p className="mb-5 text-center text-sm leading-relaxed text-muted">
              {t(current.descKey as Parameters<typeof t>[0])}
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={finish}
                className="text-xs text-muted transition-colors hover:text-text"
              >
                {t("common.skip")}
              </button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={prev} className="btn px-3 py-2 text-sm">
                    ←
                  </button>
                )}
                <button onClick={next} className="btn btn-primary px-4 py-2 text-sm">
                  {step === STEPS.length - 1 ? t("ob.start") : t("common.next")}
                </button>
              </div>
            </div>

            <div className="mt-3 text-center text-[10px] text-muted/50">
              {step + 1} / {STEPS.length}
            </div>
          </motion.div>
        </TooltipPositioner>
      </motion.div>
    </AnimatePresence>
  );
}

/** Positions the tooltip vertically relative to the (animated) spotlight rect. */
function TooltipPositioner({
  sy,
  sh,
  hasTarget,
  side,
  children,
}: {
  sy: ReturnType<typeof useSpring>;
  sh: ReturnType<typeof useSpring>;
  hasTarget: boolean;
  side: "below" | "above";
  children: React.ReactNode;
}) {
  // padding-top / padding-bottom drive the flex alignment; tooltip is centered horizontally by flex
  const paddingTop = useTransform([sy, sh], (vals) => {
    const [y, h] = vals as [number, number];
    if (!hasTarget) return 0;
    return side === "below" ? y + h + TOOLTIP_GAP : 0;
  });
  const paddingBottom = useTransform([sy, sh], (vals) => {
    const [y] = vals as [number, number];
    if (!hasTarget) return 0;
    if (typeof window === "undefined") return 0;
    return side === "above" ? window.innerHeight - y + TOOLTIP_GAP : 0;
  });

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex justify-center"
      style={{
        alignItems: !hasTarget ? "center" : side === "below" ? "flex-start" : "flex-end",
        paddingTop: hasTarget && side === "below" ? paddingTop : 16,
        paddingBottom: hasTarget && side === "above" ? paddingBottom : 16,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      {children}
    </motion.div>
  );
}
