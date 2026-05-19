"use client";

import { useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;

    const swUrl = `${BASE_PATH}/sw.js`;
    const scope = `${BASE_PATH}/`;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register(swUrl, { scope });

        // 1) Force an update check immediately on every load
        reg.update().catch(() => undefined);

        // 2) When a new SW takes over, reload the page so users get the new version
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        // 3) When a new SW finishes installing, tell it to skip waiting
        const handleNewWorker = (worker: ServiceWorker | null) => {
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage("SKIP_WAITING");
            }
          });
        };
        if (reg.installing) handleNewWorker(reg.installing);
        reg.addEventListener("updatefound", () => handleNewWorker(reg.installing));

        // 4) Periodic update check while the app is open
        setInterval(() => reg.update().catch(() => undefined), 60_000);
      } catch {
        /* noop */
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
