"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
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
const TOOLTIP_BUDGET = 260;
const SPRING = { type: "spring" as const, damping: 28, stiffness: 260, mass: 0.7 };

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [hasTarget, setHasTarget] = useState(false);
  const [tooltipSide, setTooltipSide] = useState<"below" | "above">("below");
  const [tooltipShift, setTooltipShift] = useState(0);
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
  const { t } = useLocale();
  const initialised = useRef(false);

  // Plain motion values — we drive them manually
  const sx = useMotionValue(0);
  const sy = useMotionValue(0);
  const sw = useMotionValue(0);
  const sh = useMotionValue(0);
  const sr = useTransform([sw, sh], ([w, h]) =>
    Math.min(16, Math.max(8, Math.min(w as number, h as number) / 4)),
  );

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  // Block user-driven scroll while onboarding is open
  useEffect(() => {
    if (!show) return;
    const blockWheel = (e: WheelEvent) => e.preventDefault();
    const blockTouch = (e: TouchEvent) => {
      // Allow touch inside the tooltip
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-onboarding-tooltip]")) return;
      e.preventDefault();
    };
    window.addEventListener("wheel", blockWheel, { passive: false });
    window.addEventListener("touchmove", blockTouch, { passive: false });
    return () => {
      window.removeEventListener("wheel", blockWheel);
      window.removeEventListener("touchmove", blockTouch);
    };
  }, [show]);

  /**
   * Compute target rect clamped to viewport, picking just the top portion
   * if the target is taller than tooltip can fit beside it.
   */
  const computeRect = useCallback((selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    const viewW = window.innerWidth;

    let top = r.top - PAD;
    let height = r.height + PAD * 2;
    const left = Math.max(8, r.left - PAD);
    const right = Math.min(viewW - 8, r.right + PAD);
    const width = Math.max(20, right - left);

    // If the target is too tall to leave room for the tooltip, show only the top band
    const maxH = Math.floor(viewH * 0.55);
    if (height > maxH) {
      height = maxH;
    }

    // Clamp top so spotlight stays in viewport
    top = Math.max(8, Math.min(viewH - 8 - height, top));

    return { left, top, width, height };
  }, []);

  /** Sets motion values and tooltip layout. `withSpring` controls instant vs animated. */
  const placeSpotlight = useCallback(
    (selector: string, withSpring: boolean) => {
      const rect = computeRect(selector);
      if (!rect) {
        setHasTarget(false);
        return;
      }
      const { left, top, width, height } = rect;

      if (withSpring) {
        animate(sx, left, SPRING);
        animate(sy, top, SPRING);
        animate(sw, width, SPRING);
        animate(sh, height, SPRING);
      } else {
        sx.set(left);
        sy.set(top);
        sw.set(width);
        sh.set(height);
      }

      const viewH = window.innerHeight;
      const viewW = window.innerWidth;
      const spaceBelow = viewH - (top + height);
      const side: "below" | "above" = spaceBelow >= TOOLTIP_BUDGET ? "below" : "above";
      setTooltipSide(side);

      // Compute tooltip top position, clamped to viewport
      if (side === "below") {
        const desired = top + height + TOOLTIP_GAP;
        setTooltipTop(Math.max(16, Math.min(desired, viewH - TOOLTIP_BUDGET)));
      } else {
        // Place tooltip above the spotlight, but don't go above 16px
        const desired = top - TOOLTIP_GAP - TOOLTIP_BUDGET;
        setTooltipTop(Math.max(16, desired));
      }

      const targetCenterX = left + width / 2;
      const tooltipMaxWidth = Math.min(360, viewW - 32);
      const tooltipHalf = tooltipMaxWidth / 2;
      const desiredLeft = Math.max(
        16,
        Math.min(viewW - 16 - tooltipMaxWidth, targetCenterX - tooltipHalf),
      );
      const tooltipCenter = desiredLeft + tooltipHalf;
      setTooltipShift(targetCenterX - tooltipCenter);

      setHasTarget(true);
    },
    [sx, sy, sw, sh, computeRect],
  );

  // On step change: place spotlight immediately, then optionally smooth-scroll while tracking
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

    // Stop any in-flight spring on motion values
    sx.stop();
    sy.stop();
    sw.stop();
    sh.stop();

    // Place spotlight at current location instantly
    placeSpotlight(selector, false);

    const r = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    const desiredTop = Math.max(64, (viewH - TOOLTIP_BUDGET - r.height) / 2);
    const delta = r.top - desiredTop;

    if (Math.abs(delta) < 4) return;

    let cancelled = false;
    let rafId: number | null = null;

    const tick = () => {
      if (cancelled) return;
      placeSpotlight(selector, false);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const stopTracking = () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      placeSpotlight(selector, false);
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
  }, [step, show, placeSpotlight, sx, sy, sw, sh]);

  // Re-measure on resize / orientation change (debounced)
  useEffect(() => {
    if (!show) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      const sel = STEPS[step]?.target;
      if (!sel) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => placeSpotlight(sel, true), 120);
    };
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, [show, step, placeSpotlight]);

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
      >
        {/* Overlay with cutout */}
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
            style={{ top: sy, left: sx, width: sw, height: sh }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Tooltip */}
        <div
          className="pointer-events-none fixed inset-x-0 z-10 flex justify-center px-4"
          style={{
            top: hasTarget && tooltipTop !== null ? tooltipTop : "50%",
            transform: !hasTarget || tooltipTop === null ? "translateY(-50%)" : undefined,
          }}
        >
          <motion.div
            data-onboarding-tooltip
            data-lenis-prevent
            key={step}
            initial={{ opacity: 0, y: tooltipSide === "below" ? 10 : -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="pointer-events-auto relative w-[min(360px,calc(100vw-32px))] rounded-3xl border border-border/60 bg-bg p-5 shadow-glow"
          >
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
