/* =========================================================
   HORMA — service worker
   Estrategia: cache-first para estáticos, network-first para
   la navegación (con fallback al index cacheado si no hay red).
   ========================================================= */

const CACHE_NAME = "horma-v1";

const PRECACHE_URLS = [
  "index.html",
  "css/styles.css",
  "js/app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/favicon-48.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navegación: intenta la red primero, si falla usa el index cacheado.
  if (request.mode === "navigate"){
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // Estáticos del mismo origen: cache-first, luego red, y guarda copia.
  if (new URL(request.url).origin === self.location.origin){
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        }).catch(() => cached);
      })
    );
  }
});