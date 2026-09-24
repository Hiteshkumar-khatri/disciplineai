// DisciplineAI service worker
// - Caches hashed build assets (/assets/*) cache-first (fast, offline-friendly)
// - Network-first for everything else (index.html etc.) so updates are always fresh
// - Falls back to the cached copy when offline so the app still starts
const CACHE = 'disciplineai-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isAsset = url.pathname.includes('/assets/');

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);

      // Hashed assets never change — cache-first is safe and enables offline play.
      if (isAsset && cached) return cached;

      try {
        const response = await fetch(request);
        if (response.ok && response.status === 200) {
          try {
            await cache.put(request, response.clone());
          } catch {
            /* body may be unreadable — ignore */
          }
        }
        return response;
      } catch {
        // Offline: serve the cached copy of the app shell.
        if (cached) return cached;
        return Response.error();
      }
    }),
  );
});