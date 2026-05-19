"use client";

import { useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Register only over HTTPS or on localhost
    const isSecure = window.isSecureContext;
    if (!isSecure) return;

    const swUrl = `${BASE_PATH}/sw.js`;
    const scope = `${BASE_PATH}/`;
    const onLoad = () => {
      navigator.serviceWorker
        .register(swUrl, { scope })
        .catch(() => {
          // Fail silently — SW is progressive enhancement only.
        });
    };
    // Defer to load to avoid competing with first paint
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }
  }, []);

  return null;
}
