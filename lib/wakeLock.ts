"use client";

import { useEffect, useRef } from "react";

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

/**
 * Keeps the screen awake while `active` is true.
 * Re-acquires the lock when the page becomes visible again.
 */
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as WakeLockNavigator;
    if (!nav.wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      if (!active || cancelled) return;
      try {
        const sentinel = await nav.wakeLock!.request("screen");
        if (cancelled) {
          await sentinel.release().catch(() => undefined);
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          sentinelRef.current = null;
        });
      } catch {
        // Permission denied or unsupported — fail silently.
      }
    };

    const release = async () => {
      const s = sentinelRef.current;
      sentinelRef.current = null;
      if (s && !s.released) {
        await s.release().catch(() => undefined);
      }
    };

    if (active) {
      acquire();
      const onVisibility = () => {
        if (document.visibilityState === "visible" && active && !sentinelRef.current) {
          acquire();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      return () => {
        cancelled = true;
        document.removeEventListener("visibilitychange", onVisibility);
        release();
      };
    }
    return () => {
      cancelled = true;
      release();
    };
  }, [active]);
}
