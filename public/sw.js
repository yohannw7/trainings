/* ASH Train service worker */
// Bump VERSION on every meaningful change to force a fresh cache
const VERSION = "2026-05-20-1";
const CACHE = `ash-train-${VERSION}`;
const SCOPE = self.registration ? new URL(self.registration.scope).pathname : "/";

const PRECACHE_URLS = [
  SCOPE,
  `${SCOPE}index.html`,
  `${SCOPE}manifest.webmanifest`,
  `${SCOPE}icons/icon-192.png`,
  `${SCOPE}icons/icon-512.png`,
  `${SCOPE}apple-touch-icon.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE_URLS).catch(() => undefined);
      // Activate this SW immediately, replacing any waiting one
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(SCOPE);
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML / navigations: always network first, fall back to cached index when offline
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Code & data files (JS / CSS / JSON): network first to always pick up new builds
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "" ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".webmanifest")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Images / fonts / static media: stale-while-revalidate is fine
  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone()).catch(() => undefined);
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await cache.match(`${SCOPE}index.html`);
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === "basic") {
        cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise) || new Response("", { status: 504 });
}
