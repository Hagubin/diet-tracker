/* Diet PWA — network-first for app updates (bump CACHE_ID when releasing). */
const CACHE_ID = "diet-v64";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_ID).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isAppFile =
    path.endsWith(".html") ||
    path.endsWith(".js") ||
    path.endsWith(".css") ||
    path.endsWith(".json") ||
    path.endsWith("/diet-tracker") ||
    path.endsWith("/diet-tracker/");

  if (!isAppFile) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_ID).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
