"use client";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function showRestDoneNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  try {
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

/**
 * Schedules a notification to fire after `delaySec` seconds via the Service Worker.
 * This works even when the page is backgrounded because the SW stays alive briefly
 * after receiving a message.
 */
export function scheduleRestNotification(delaySec: number, title: string, body: string) {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      delay: delaySec * 1000,
      title,
      body,
      icon: `${BASE_PATH}/icons/icon-192.png`,
    });
  }
}

/** Cancel a previously scheduled notification */
export function cancelScheduledNotification() {
  if (typeof window === "undefined") return;
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CANCEL_NOTIFICATION" });
  }
}
