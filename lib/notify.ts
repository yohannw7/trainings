"use client";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function showRestDoneNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  // If document is visible, the in-app beep + vibrate is enough
  if (document.visibilityState === "visible") return;

  try {
    // Prefer SW notifications when available — they show on locked screen / background tabs
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon: `${BASE_PATH}/icons/icon-192.png`,
            badge: `${BASE_PATH}/icons/icon-192.png`,
            tag: "ash-rest",
            renotify: true,
            silent: false,
            vibrate: [200, 100, 200],
          } as NotificationOptions & { vibrate?: number[]; renotify?: boolean });
        })
        .catch(() => undefined);
      return;
    }
    new Notification(title, { body, icon: `${BASE_PATH}/icons/icon-192.png`, tag: "ash-rest" });
  } catch {
    /* noop */
  }
}
