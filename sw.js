const CACHE_NAME = 'portfolio-v2';
const ASSETS = [
  '/styles.css',
  '/js/script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Use network-first for navigation/HTML (so updated index.html is fetched)
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(event.request).then(networkRes => {
        // update cache for navigation requests
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkRes.clone()));
        return networkRes;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other assets: cache-first with network fallback and cache update
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(networkRes => {
        // Only cache successful responses
        if (!networkRes || networkRes.status !== 200 || networkRes.type === 'opaque') return networkRes;
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkRes.clone()));
        return networkRes;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
